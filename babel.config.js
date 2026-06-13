module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-worklets/plugin son sırada olmalı (reanimated 4 gereği).
    // Şu an worklet kullanmıyoruz; ileride animasyon eklenince hazır olsun diye burada.
    plugins: ['react-native-worklets/plugin'],
  };
};
