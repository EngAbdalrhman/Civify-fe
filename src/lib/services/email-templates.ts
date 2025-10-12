/**
 * Email Templates
 *
 * All email templates for HICv application
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Base email layout
const emailLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HICv</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .stats {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HICv</h1>
    <p>AI-Powered CV Tailoring</p>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>© 2025 HICv. All rights reserved.</p>
    <p>You're receiving this email because you have an account with HICv.</p>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  /**
   * Welcome email for new users
   */
  welcome: (name: string): EmailTemplate => ({
    subject: "Welcome to HICv! 🎉",
    html: emailLayout(`
      <h2>Welcome to HICv, ${name}!</h2>
      <p>Thank you for signing up. We're excited to help you create tailored CVs that stand out!</p>
      
      <h3>Your Free Plan Includes:</h3>
      <ul>
        <li>✅ 5 CV generations per month</li>
        <li>✅ AI-powered CV tailoring</li>
        <li>✅ Personal information masking</li>
        <li>✅ Professional PDF exports</li>
      </ul>
      
      <p>Ready to get started?</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Create Your First CV</a>
      
      <p>Need more? <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans">View our plans</a></p>
      
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Welcome to HICv, ${name}!\n\nThank you for signing up. Your free plan includes 5 CV generations per month, AI-powered tailoring, and more.\n\nGet started: ${process.env.NEXT_PUBLIC_APP_URL}`,
  }),

  /**
   * CV limit warning (2 or fewer remaining)
   */
  cvLimitWarning: (name: string, remaining: number): EmailTemplate => ({
    subject: `⚠️ You have ${remaining} CV generation${
      remaining === 1 ? "" : "s"
    } remaining`,
    html: emailLayout(`
      <h2>Hi ${name},</h2>
      <p>Just a friendly reminder that you have <strong>${remaining}</strong> CV generation${
      remaining === 1 ? "" : "s"
    } remaining this month.</p>
      
      <div class="stats">
        <p><strong>Remaining:</strong> ${remaining} generation${
      remaining === 1 ? "" : "s"
    }</p>
        <p><strong>Resets:</strong> 1st of next month</p>
      </div>
      
      <p>Want unlimited CV generations?</p>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL
      }/dashboard/plans" class="button">Upgrade Your Plan</a>
      
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Hi ${name},\n\nYou have ${remaining} CV generation${
      remaining === 1 ? "" : "s"
    } remaining this month.\n\nUpgrade: ${
      process.env.NEXT_PUBLIC_APP_URL
    }/dashboard/plans`,
  }),

  /**
   * CV limit reached
   */
  cvLimitReached: (name: string, resetDate: string): EmailTemplate => ({
    subject: "🚫 Monthly CV Generation Limit Reached",
    html: emailLayout(`
      <h2>Hi ${name},</h2>
      <p>You've reached your monthly CV generation limit.</p>
      
      <div class="stats">
        <p><strong>Limit Reached:</strong> Yes</p>
        <p><strong>Resets On:</strong> ${resetDate}</p>
      </div>
      
      <p>Can't wait? Upgrade now for unlimited generations!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans" class="button">View Plans</a>
      
      <h3>Premium Benefits:</h3>
      <ul>
        <li>50 CV generations per month</li>
        <li>Priority support</li>
        <li>Advanced features</li>
      </ul>
      
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Hi ${name},\n\nYou've reached your monthly CV generation limit. It will reset on ${resetDate}.\n\nUpgrade for more: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans`,
  }),

  /**
   * Plan upgrade confirmation
   */
  planUpgrade: (
    name: string,
    plan: string,
    features: string[]
  ): EmailTemplate => ({
    subject: `🎉 Welcome to ${
      plan.charAt(0).toUpperCase() + plan.slice(1)
    } Plan!`,
    html: emailLayout(`
      <h2>Congratulations, ${name}!</h2>
      <p>Your plan has been successfully upgraded to <strong>${
        plan.charAt(0).toUpperCase() + plan.slice(1)
      }</strong>.</p>
      
      <h3>Your New Benefits:</h3>
      <ul>
        ${features.map((f) => `<li>✅ ${f}</li>`).join("")}
      </ul>
      
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL
      }/dashboard" class="button">Go to Dashboard</a>
      
      <p>Thank you for your support!</p>
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Congratulations, ${name}!\n\nYour plan has been upgraded to ${plan}.\n\nDashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  }),

  /**
   * License activation
   */
  licenseActivated: (name: string, licenseKey: string): EmailTemplate => ({
    subject: "🔑 License Activated Successfully",
    html: emailLayout(`
      <h2>Hi ${name},</h2>
      <p>Your license has been activated successfully!</p>
      
      <div class="stats">
        <p><strong>License Key:</strong> <code>${licenseKey}</code></p>
        <p><strong>Status:</strong> Active</p>
      </div>
      
      <p>You now have access to API features!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-keys" class="button">Generate API Key</a>
      
      <p>View the <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-docs">API documentation</a> to get started.</p>
      
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Hi ${name},\n\nYour license (${licenseKey}) has been activated!\n\nGenerate API key: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-keys`,
  }),

  /**
   * API key generated
   */
  apiKeyGenerated: (name: string, apiKey: string): EmailTemplate => ({
    subject: "🔐 New API Key Generated",
    html: emailLayout(`
      <h2>Hi ${name},</h2>
      <p>A new API key has been generated for your account.</p>
      
      <div class="stats">
        <p><strong>⚠️ Important:</strong> This is the only time you'll see this key. Please save it securely.</p>
        <p><code style="background: #f0f0f0; padding: 10px; display: block; word-break: break-all;">${apiKey}</code></p>
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-docs" class="button">View API Docs</a>
      
      <p>Keep your API key secure and never share it publicly.</p>
      
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Hi ${name},\n\nNew API key generated: ${apiKey}\n\nIMPORTANT: Save this key securely. You won't see it again.\n\nAPI Docs: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-docs`,
  }),

  /**
   * API quota warning
   */
  apiQuotaWarning: (
    name: string,
    usage: number,
    limit: number,
    percentage: number
  ): EmailTemplate => ({
    subject: `⚠️ API Quota Warning: ${percentage}% Used`,
    html: emailLayout(`
      <h2>Hi ${name},</h2>
      <p>You've used <strong>${usage}</strong> out of <strong>${limit}</strong> API calls this month (${percentage}%).</p>
      
      <div class="stats">
        <p><strong>Used:</strong> ${usage} calls</p>
        <p><strong>Limit:</strong> ${limit} calls</p>
        <p><strong>Remaining:</strong> ${limit - usage} calls</p>
        <p><strong>Resets:</strong> 1st of next month</p>
      </div>
      
      <p>Need more API calls?</p>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL
      }/dashboard/plans" class="button">Upgrade Plan</a>
      
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Hi ${name},\n\nAPI usage: ${usage}/${limit} (${percentage}%)\nRemaining: ${
      limit - usage
    } calls\n\nUpgrade: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans`,
  }),

  /**
   * Monthly usage report
   */
  monthlyReport: (
    name: string,
    stats: {
      cvCount: number;
      cvLimit: number;
      apiUsage?: number;
      apiLimit?: number;
      plan: string;
    }
  ): EmailTemplate => ({
    subject: "📊 Your Monthly HICv Report",
    html: emailLayout(`
      <h2>Hi ${name},</h2>
      <p>Here's your monthly usage report:</p>
      
      <div class="stats">
        <h3>CV Generations</h3>
        <p><strong>Used:</strong> ${stats.cvCount} / ${stats.cvLimit}</p>
        
        ${
          stats.apiUsage !== undefined
            ? `
          <h3>API Calls</h3>
          <p><strong>Used:</strong> ${stats.apiUsage} / ${stats.apiLimit}</p>
        `
            : ""
        }
        
        <h3>Current Plan</h3>
        <p><strong>${
          stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)
        }</strong></p>
      </div>
      
      <p>Want to do more?</p>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL
      }/dashboard/plans" class="button">Upgrade Plan</a>
      
      <p>Thank you for using HICv!</p>
      <p>Best regards,<br>The Civify Team</p>
    `),
    text: `Hi ${name},\n\nMonthly Report:\n- CV: ${stats.cvCount}/${
      stats.cvLimit
    }\n${
      stats.apiUsage !== undefined
        ? `- API: ${stats.apiUsage}/${stats.apiLimit}\n`
        : ""
    }- Plan: ${stats.plan}\n\nUpgrade: ${
      process.env.NEXT_PUBLIC_APP_URL
    }/dashboard/plans`,
  }),
};

export default emailTemplates;
