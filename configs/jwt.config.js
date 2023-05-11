module.exports = {
  secret: process.env.JWT_SECRET || 'NeverGonnaGiveYouUp',
  wrongSecret: process.env.JWT_WRONGSECRET || 'NeverGonnaLetYouDown'
}