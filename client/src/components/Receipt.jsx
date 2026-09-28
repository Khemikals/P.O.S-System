export default function Receipt({ sale, shopName = "Mommy's Shop" }) {
  if (!sale) return null;

  return (
    <div id="receipt-print-area" style={{
      maxWidth: 300,
      margin: '20px auto',
      padding: 15,
      border: '1px dashed #999',
      fontFamily: 'monospace',
      fontSize: 14
    }}>
      <h3 style={{ textAlign: 'center', margin: 0 }}>{shopName}</h3>
      <p style={{ textAlign: 'center', margin: '5px 0' }}>Receipt</p>
      <hr />
      <p>Date: {new Date(sale.createdAt || Date.now()).toLocaleString()}</p>
      {sale._id && <p>Txn ID: {sale._id.slice(-8).toUpperCase()}</p>}
      <hr />
      {sale.items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{item.name} x{item.qty}</span>
          <span>₵{(item.priceAtSale * item.qty).toFixed(2)}</span>
        </div>
      ))}
      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>TOTAL</span>
        <span>₵{sale.total.toFixed(2)}</span>
      </div>
      <p>Payment: {sale.paymentMethod === 'momo' ? 'Mobile Money' : 'Cash'}</p>
      <hr />
      <p style={{ textAlign: 'center' }}>Thank you for your patronage!</p>
    </div>
  );
}