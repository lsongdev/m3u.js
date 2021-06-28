
export const parseAttributes = data => {
  const attrs = data && data.match(/(\w+-?\w+)="(.*?)"/gi);
  if (!attrs) return attrs;
  return attrs.reduce((obj, attr) => {
    const index = attr.indexOf('=');
    const key = attr.substring(0, index);
    const value = attr.substring(index + 1, attr.length - 1);
    return obj[key] = value.replace(/^"|"$/g, ''), obj;
  }, {});
};

export const parseEXTM3U = data => {
  return parseAttributes(data);
};

export const parseEXTINF = data => {
  const track = {};
  const m = data.match(/^(-?\d+)(\s.+)?,(\s?.*)$/);
  if (!m) throw new Error('Invalid EXTINF: ' + data);
  const [_, duration, attrs, channelName] = m;
  track.name = channelName;
  track.duration = +duration;
  track.attrs = parseAttributes(attrs);
  // tvg
  for (const [key, value] of Object.entries(track.attrs || {})) {
    if (key.startsWith('tvg-')) {
      track.tvg = track.tvg || {};
      track.tvg[key.replace('tvg-', '')] = value;
      delete track.attrs[key];
    }
  }
  // catchup
  if (track.attrs && track.attrs.catchup) {
    track.catchup = {
      type: track.attrs.catchup,
    };
    delete track.attrs['catchup'];
    for (const [key, value] of Object.entries(track.attrs || {})) {
      if (key.startsWith('catchup-')) {
        track.catchup = track.tvg || {};
        track.catchup[key.replace('catchup-', '')] = value;
        delete track.attrs[key];
      }
    }
  }
  return track;
};

export const createReader = () => {
  var track;
  var buffer = '';
  var output = {
    items: [],
  };
  const process = (directive, data, line) => {
    switch (directive) {
      case 'EXTM3U':
        output.header = parseEXTM3U(data);
        output.header.raw = line;
        break;
      case 'EXTINF':
        track = parseEXTINF(data);
        track.raw = line;
        break;
      case 'EXTGRP':
        track.group = data;
        break;
      case 'EXTVLCOPT':
        break;
      default:
        console.warn(`Unknown directive: ${directive}`);
        break;
    }
  };
  const parseLine = line => {
    const m = line.match(/^#(\w+)[\s|:]/);
    if (m && m[1]) {
      const offset = (m[1] + '#:').length;
      const data = line.slice(offset);
      return process(m[1], data.trim(), line);
    }
    if (track && !track.location) {
      track.location = line;
      output.items.push(track);
    }

  };
  return {
    get result() {
      this.read('\n');
      return output;
    },
    read(str) {
      str = String(str);
      for (var i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '\n') {
          parseLine(buffer);
          buffer = '';
        } else {
          buffer += char;
        }
      }
    }
  }
};
