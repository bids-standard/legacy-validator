export default {
  sessionMatcher: new RegExp('(ses-.*?)/'),

  Subject: function () {
    this.files = []
    this.sessions = []
    this.missingSessions = []
  },
}
