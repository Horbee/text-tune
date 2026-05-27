var params = new URLSearchParams(window.location.search)
var client_id = params.get('client_id') || 'electron'
var code_challenge = params.get('code_challenge')
var code_challenge_method = params.get('code_challenge_method') || 'S256'
var state = params.get('state')

var SECTIONS = ['s-loading', 's-form', 's-check-email', 's-transferring', 's-error']

function show(id) {
  SECTIONS.forEach(function (s) {
    document.getElementById(s).classList.add('hidden')
  })
  document.getElementById(id).classList.remove('hidden')
}

function showError(msg) {
  document.getElementById('error-msg-text').textContent = msg
  show('s-error')
}

function getCookie(name) {
  var v = '; ' + document.cookie
  var parts = v.split('; ' + name + '=')
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift())
  return null
}

async function transferToElectron() {
  if (!code_challenge || !state) {
    showError('Missing authentication parameters. Please open Text Tune and sign in from there.')
    return
  }
  show('s-transferring')
  try {
    var query = new URLSearchParams({
      client_id: client_id,
      state: state,
      code_challenge: code_challenge,
      code_challenge_method: code_challenge_method,
    })
    var res = await fetch('/api/auth/electron/transfer-user?' + query.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callbackURL: 'texttune://auth/callback' }),
      credentials: 'include',
    })
    if (!res.ok) {
      var body = await res.text()
      throw new Error('Transfer failed (' + res.status + '): ' + body)
    }
    var token = getCookie('better-auth.electron')
    if (!token) throw new Error('Redirect token missing — please try signing in again.')
    window.location.href = 'texttune://auth/callback#token=' + encodeURIComponent(token)
  } catch (e) {
    showError(e.message || String(e))
  }
}

async function init() {
  try {
    var res = await fetch('/api/auth/get-session', { credentials: 'include' })
    var data = await res.json()
    if (data && data.user) {
      await transferToElectron()
    } else {
      show('s-form')
    }
  } catch (_) {
    show('s-form')
  }
}

document.getElementById('email-form').addEventListener('submit', async function (e) {
  e.preventDefault()
  var email = document.getElementById('email-input').value.trim()
  if (!email) return

  var btn = document.getElementById('submit-btn')
  var errEl = document.getElementById('form-error')
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span> Sending&hellip;'
  errEl.classList.add('hidden')

  try {
    // callbackURL is the current URL so the PKCE params survive the post-verification redirect
    var res = await fetch('/api/auth/sign-in/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, callbackURL: window.location.href }),
      credentials: 'include',
    })
    if (!res.ok) {
      var errData = await res.json().catch(function () {
        return {}
      })
      throw new Error(errData.message || 'Failed to send magic link. Please try again.')
    }
    document.getElementById('sent-email').textContent = email
    show('s-check-email')
  } catch (err) {
    btn.disabled = false
    btn.textContent = 'Send Magic Link'
    errEl.textContent = err.message || String(err)
    errEl.classList.remove('hidden')
  }
})

document.getElementById('try-again').addEventListener('click', function () {
  show('s-form')
})

init()
