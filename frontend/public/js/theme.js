/* theme.js - head me chalta hai, taaki page khulte hi sahi design lage (flash na ho) */
(function () {
  var t = 'sky';
  try {
    var d = JSON.parse(localStorage.getItem('boc_data_v1'));
    if (d && d.settings && /^(sky|night)$/.test(d.settings.theme)) t = d.settings.theme;
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', t);
})();
