import { Icon } from '../../shared/components/BankIdentity';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { money } from '../../shared/utils/money';
import { qrPayload } from './qrPayload';
import type { Receipt } from '../../shared/types/bank';
/** Renders a confirmed receipt. Regeneration is presentation-only and cannot submit money. */
export function ReceiptPanel({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  const [image, setImage] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    let active = true;
    setImage('');
    setFailed(false);
    QRCode.toDataURL(qrPayload(receipt), { width: 464, margin: 4, errorCorrectionLevel: 'M' }).then(
      (url) => {
        if (active) setImage(url);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [receipt, attempt]);
  return (
    <section className="receipt" aria-labelledby="receipt-heading">
      <div className="receipt-heading-row">
        <span className="receipt-seal">
          <Icon name="check" />
        </span>
        <span className="success">Transferencia confirmada</span>
      </div>
      <h2 id="receipt-heading" ref={heading} tabIndex={-1}>
        Tu comprobante
      </h2>
      <p>Dinero ficticio · Simulación académica</p>
      <div className="receipt-body">
        <dl>
          <dt>Monto</dt>
          <dd>{money(receipt.amount)}</dd>
          <dt>Origen → destino</dt>
          <dd>
            {receipt.sourceAccountMasked} → {receipt.targetAccountMasked}
          </dd>
          <dt>Fecha</dt>
          <dd>{new Date(receipt.occurredAt).toLocaleString('es-CO')}</dd>
          <dt>Referencia</dt>
          <dd data-testid="reference">{receipt.reference}</dd>
        </dl>
        {image ? (
          <img
            className="receipt-qr"
            data-testid="qr"
            src={image}
            alt="QR con referencia, monto y cuentas parcialmente ocultas de la transferencia"
          />
        ) : failed ? (
          <div role="alert">
            <p>La transferencia está confirmada. No se pudo mostrar el QR.</p>
            <button onClick={() => setAttempt((x) => x + 1)}>Regenerar QR</button>
          </div>
        ) : (
          <p role="status">Preparando QR…</p>
        )}
      </div>
      <p className="hint">
        El QR es un resumen de la simulación, no autoriza pagos ni certifica autenticidad.
      </p>
      {image && (
        <a className="download-qr" href={image} download={`comprobante-${receipt.reference}.png`}>
          <Icon name="down" />
          Guardar QR
        </a>
      )}
      <button className="secondary" onClick={onClose}>
        Cerrar comprobante
      </button>
    </section>
  );
}
