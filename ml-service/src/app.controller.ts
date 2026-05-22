import { Body, Controller, Get, Header, Logger, Post } from '@nestjs/common'
import { LlmService } from '@/llm/llm.service'
import { type GecInputDto, gecInputSchema } from '@/dto/gec-input.dto'
import { GecResponseDto } from '@/dto/gec-response.dto'
import { ZodValidationPipe } from './pipes/zod-validation'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

const SIGN_IN_HTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in — Text Tune</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .card {
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 40px;
      width: 90%;
      max-width: 420px;
      text-align: center;
    }
    h2 { font-size: 1.4rem; font-weight: 600; margin-bottom: 8px; }
    .subtitle { color: #aaa; font-size: 0.9rem; margin-bottom: 28px; line-height: 1.5; }
    input[type="email"] {
      width: 100%;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.07);
      color: #fff;
      font-size: 1rem;
      margin-bottom: 14px;
      outline: none;
      transition: border-color 0.15s;
    }
    input[type="email"]::placeholder { color: #555; }
    input[type="email"]:focus { border-color: rgba(255, 255, 255, 0.35); }
    .btn {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: none;
      background: #e9ecef;
      color: #1a1a2e;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn:hover:not(:disabled) { opacity: 0.88; }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .error-msg { color: #ff6b6b; font-size: 0.85rem; margin-top: 12px; }
    .back-link {
      display: inline-block;
      margin-top: 18px;
      font-size: 0.82rem;
      color: #888;
      cursor: pointer;
      text-decoration: underline;
    }
    .back-link:hover { color: #bbb; }
    .hidden { display: none !important; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(26, 26, 46, 0.3);
      border-top-color: #1a1a2e;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .icon { font-size: 2rem; margin-bottom: 16px; }
  </style>
</head>
<body>
<div class="card">

  <!-- Loading -->
  <div id="s-loading">
    <div class="subtitle">Checking session&hellip;</div>
  </div>

  <!-- Email form -->
  <div id="s-form" class="hidden">
    <div class="icon">✦</div>
    <h2>Sign in to Text Tune</h2>
    <p class="subtitle">Enter your email to receive a magic link</p>
    <form id="email-form" novalidate>
      <input id="email-input" type="email" placeholder="you@example.com" autocomplete="email" />
      <button type="submit" class="btn" id="submit-btn">Send Magic Link</button>
    </form>
    <div id="form-error" class="error-msg hidden"></div>
  </div>

  <!-- Check email -->
  <div id="s-check-email" class="hidden">
    <div class="icon">📬</div>
    <h2>Check your email</h2>
    <p class="subtitle">
      We sent a magic link to <strong id="sent-email"></strong>.<br />
      Click the link to complete sign-in.
    </p>
    <p class="subtitle" style="font-size:0.8rem">
      Didn't get it? Check your spam folder or&nbsp;<span class="back-link" id="try-again">try a different email</span>.
    </p>
  </div>

  <!-- Transferring to app -->
  <div id="s-transferring" class="hidden">
    <div class="icon">🔐</div>
    <h2>Signing you in&hellip;</h2>
    <p class="subtitle">Transferring your session to Text Tune.</p>
  </div>

  <!-- Error -->
  <div id="s-error" class="hidden">
    <div class="icon">⚠️</div>
    <h2>Something went wrong</h2>
    <p class="subtitle" id="error-msg-text"></p>
    <button class="btn" style="max-width:180px;margin:0 auto" onclick="location.reload()">Try again</button>
  </div>

</div>
<script>
(function () {
  var params = new URLSearchParams(window.location.search);
  var client_id            = params.get('client_id') || 'electron';
  var code_challenge       = params.get('code_challenge');
  var code_challenge_method = params.get('code_challenge_method') || 'S256';
  var state                = params.get('state');

  var SECTIONS = ['s-loading', 's-form', 's-check-email', 's-transferring', 's-error'];

  function show(id) {
    SECTIONS.forEach(function (s) { document.getElementById(s).classList.add('hidden'); });
    document.getElementById(id).classList.remove('hidden');
  }

  function showError(msg) {
    document.getElementById('error-msg-text').textContent = msg;
    show('s-error');
  }

  function getCookie(name) {
    var v = '; ' + document.cookie;
    var parts = v.split('; ' + name + '=');
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  }

  async function transferToElectron() {
    if (!code_challenge || !state) {
      showError('Missing authentication parameters. Please open Text Tune and sign in from there.');
      return;
    }
    show('s-transferring');
    try {
      var query = new URLSearchParams({
        client_id: client_id,
        state: state,
        code_challenge: code_challenge,
        code_challenge_method: code_challenge_method
      });
      var res = await fetch('/api/auth/electron/transfer-user?' + query.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callbackURL: 'texttune://auth/callback' }),
        credentials: 'include'
      });
      if (!res.ok) {
        var body = await res.text();
        throw new Error('Transfer failed (' + res.status + '): ' + body);
      }
      var token = getCookie('better-auth.electron');
      if (!token) throw new Error('Redirect token missing — please try signing in again.');
      window.location.href = 'texttune://auth/callback#token=' + encodeURIComponent(token);
    } catch (e) {
      showError(e.message || String(e));
    }
  }

  async function init() {
    try {
      var res = await fetch('/api/auth/get-session', { credentials: 'include' });
      var data = await res.json();
      if (data && data.user) {
        await transferToElectron();
      } else {
        show('s-form');
      }
    } catch (_) {
      show('s-form');
    }
  }

  document.getElementById('email-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = document.getElementById('email-input').value.trim();
    if (!email) return;

    var btn    = document.getElementById('submit-btn');
    var errEl  = document.getElementById('form-error');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Sending&hellip;';
    errEl.classList.add('hidden');

    try {
      // callbackURL is the current URL so the PKCE params survive the post-verification redirect
      var res = await fetch('/api/auth/sign-in/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, callbackURL: window.location.href }),
        credentials: 'include'
      });
      if (!res.ok) {
        var errData = await res.json().catch(function () { return {}; });
        throw new Error(errData.message || 'Failed to send magic link. Please try again.');
      }
      document.getElementById('sent-email').textContent = email;
      show('s-check-email');
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Send Magic Link';
      errEl.textContent = err.message || String(err);
      errEl.classList.remove('hidden');
    }
  });

  document.getElementById('try-again').addEventListener('click', function () {
    show('s-form');
  });

  init();
}());
</script>
</body>
</html>`

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly llmService: LlmService) {}

  @Get()
  @AllowAnonymous()
  getHealth(): { message: string } {
    return { message: 'ML Service is running' }
  }

  @Get('sign-in')
  @AllowAnonymous()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getSignIn(): string {
    return SIGN_IN_HTML
  }

  @Post('api/generate-correction')
  async postGenerateCorrection(
    @Body(new ZodValidationPipe(gecInputSchema)) gecInputDto: GecInputDto
  ): Promise<GecResponseDto> {
    this.logger.log(`Received GEC request with input: "${gecInputDto.text}" and model: "${gecInputDto.model}"`)
    const correctedText = await this.llmService.generateCorrection(gecInputDto.text, gecInputDto.model)
    return { corrected: correctedText.trim(), original: gecInputDto.text }
  }
}
