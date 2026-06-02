# Community GreenToken — Billing Page Starter Code

This Markdown provides a **starter React/Next.js code** for the Billing page of Community GreenToken, including all main components and page structure.

---

## Folder Structure
```
frontend/
├─ components/
│  ├─ BillingAlertBanner.jsx
│  ├─ CurrentPlanCard.jsx
│  ├─ PlanUsageSummary.jsx
│  ├─ TrialCountdown.jsx
│  ├─ InvoiceList.jsx
│  └─ PaymentMethodCard.jsx
├─ pages/
│  └─ org/admin/billing.jsx
```

---

## Billing Page (`billing.jsx`)
```jsx
import React from 'react';
import BillingAlertBanner from '../../../components/BillingAlertBanner';
import CurrentPlanCard from '../../../components/CurrentPlanCard';
import PlanUsageSummary from '../../../components/PlanUsageSummary';
import TrialCountdown from '../../../components/TrialCountdown';
import InvoiceList from '../../../components/InvoiceList';
import PaymentMethodCard from '../../../components/PaymentMethodCard';

export default function BillingPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Alert Banner */}
      <BillingAlertBanner message="Your payment is past due. Update your payment method to avoid service interruption." />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <CurrentPlanCard plan="Pro Plan" price="$49/month" renewalDate="May 25, 2025" />
        <PlanUsageSummary membersUsed={28} membersLimit={50} features={['Advanced Analytics', 'AI Insights', 'Custom Integrations']} lockedFeatures={['White-label Reports']} />
        <PaymentMethodCard cardType="Visa" lastFour="4242" expiry="04/28" />
      </div>

      {/* Trial Countdown */}
      <div className="mt-6">
        <TrialCountdown daysRemaining={7} totalDays={14} />
      </div>

      {/* Invoices */}
      <div className="mt-6">
        <InvoiceList invoices={[
          {id: 'INV_2025_0421', date: 'Apr 21, 2025', description: 'Pro Plan - Monthly', amount: '$49.00', status: 'Paid'},
          {id: 'INV_2025_0321', date: 'Mar 21, 2025', description: 'Pro Plan - Monthly', amount: '$49.00', status: 'Paid'}
        ]}/>
      </div>
    </div>
  );
}
```

---

## Component Examples

### BillingAlertBanner.jsx
```jsx
export default function BillingAlertBanner({ message }) {
  return (
    <div className="bg-red-100 text-red-800 p-4 rounded-md font-semibold">
      {message}
    </div>
  );
}
```

### CurrentPlanCard.jsx
```jsx
export default function CurrentPlanCard({ plan, price, renewalDate }) {
  return (
    <div className="bg-green-600 text-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold">{plan}</h3>
      <p className="mt-2">{price}</p>
      <p className="mt-1 text-sm">Renews on {renewalDate}</p>
    </div>
  );
}
```

### PlanUsageSummary.jsx
```jsx
export default function PlanUsageSummary({ membersUsed, membersLimit, features, lockedFeatures }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold mb-2">Plan Usage Summary</h3>
      <p>{membersUsed} / {membersLimit} members used</p>
      <ul className="mt-2">
        {features.map(f => <li key={f}>✔ {f}</li>)}
        {lockedFeatures.map(f => <li key={f} className="text-gray-400">🔒 {f}</li>)}
      </ul>
    </div>
  );
}
```

### TrialCountdown.jsx
```jsx
export default function TrialCountdown({ daysRemaining, totalDays }) {
  const progress = (daysRemaining / totalDays) * 100;
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="font-bold mb-2">Trial Countdown</h4>
      <p>{daysRemaining} days left in your trial</p>
      <div className="bg-gray-200 h-3 w-full rounded mt-2">
        <div className="bg-green-600 h-3 rounded" style={{width: `${progress}%`}}></div>
      </div>
    </div>
  );
}
```

### InvoiceList.jsx
```jsx
export default function InvoiceList({ invoices }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="font-bold mb-2">Recent Invoices</h4>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.date}</td>
              <td>{inv.description}</td>
              <td>{inv.amount}</td>
              <td>{inv.status}</td>
              <td><button className="text-blue-600">Download</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### PaymentMethodCard.jsx
```jsx
export default function PaymentMethodCard({ cardType, lastFour, expiry }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h4 className="font-bold mb-2">Payment Method</h4>
      <p>{cardType} •••• {lastFour}</p>
      <p>Expires {expiry}</p>
      <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Update Payment</button>
    </div>
  );
}
```

---

This setup mirrors the **Billing page mockup** and provides a modular, reusable React component structure. Tailwind CSS classes are included for quick styling.

