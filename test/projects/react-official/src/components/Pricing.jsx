export default function Pricing() {
  return (
    <section className="slide" id="pricing">
      <div className="pricing-header">
        <p id="pricing-eyebrow">Pricing</p>
        <h2 id="pricing-title">Plans for every scale</h2>
        <p id="pricing-subtitle">
          Start free, upgrade when you are ready. No hidden fees.
        </p>
      </div>
      <table id="pricing-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Starter</th>
            <th>Pro</th>
            <th>Enterprise</th>
          </tr>
        </thead>
        <tbody>
          <tr id="pricing-row-0">
            <td id="pricing-feature-0">Monthly price</td>
            <td id="pricing-starter-0">Free</td>
            <td id="pricing-pro-0">$49 / seat</td>
            <td id="pricing-enterprise-0">Custom</td>
          </tr>
          <tr id="pricing-row-1">
            <td id="pricing-feature-1">Data sources</td>
            <td id="pricing-starter-1">Up to 3</td>
            <td id="pricing-pro-1">Up to 50</td>
            <td id="pricing-enterprise-1">Unlimited</td>
          </tr>
          <tr id="pricing-row-2">
            <td id="pricing-feature-2">Queries per month</td>
            <td id="pricing-starter-2">1,000</td>
            <td id="pricing-pro-2">100,000</td>
            <td id="pricing-enterprise-2">Unlimited</td>
          </tr>
          <tr id="pricing-row-3">
            <td id="pricing-feature-3">AI insights</td>
            <td className="pricing-dash" id="pricing-starter-3">--</td>
            <td className="pricing-check" id="pricing-pro-3">Included</td>
            <td className="pricing-check" id="pricing-enterprise-3">Advanced</td>
          </tr>
          <tr id="pricing-row-4">
            <td id="pricing-feature-4">SSO / SAML</td>
            <td className="pricing-dash" id="pricing-starter-4">--</td>
            <td className="pricing-dash" id="pricing-pro-4">--</td>
            <td className="pricing-check" id="pricing-enterprise-4">Included</td>
          </tr>
          <tr id="pricing-row-5">
            <td id="pricing-feature-5">Custom dashboards</td>
            <td id="pricing-starter-5">5</td>
            <td id="pricing-pro-5">Unlimited</td>
            <td id="pricing-enterprise-5">Unlimited</td>
          </tr>
          <tr id="pricing-row-6">
            <td id="pricing-feature-6">API access</td>
            <td className="pricing-dash" id="pricing-starter-6">--</td>
            <td className="pricing-check" id="pricing-pro-6">REST API</td>
            <td className="pricing-check" id="pricing-enterprise-6">Full API + Webhooks</td>
          </tr>
          <tr id="pricing-row-7">
            <td id="pricing-feature-7">Support</td>
            <td id="pricing-starter-7">Community</td>
            <td id="pricing-pro-7">Email + Chat</td>
            <td id="pricing-enterprise-7">Dedicated CSM</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td>
              <button className="pricing-btn pricing-btn-starter" id="pricing-btn-starter">
                Get Started
              </button>
            </td>
            <td>
              <button className="pricing-btn pricing-btn-pro" id="pricing-btn-pro">
                Start Free Trial
              </button>
            </td>
            <td>
              <button className="pricing-btn pricing-btn-enterprise" id="pricing-btn-enterprise">
                Contact Sales
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
