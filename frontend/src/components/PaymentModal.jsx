import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { paymentsAPI } from "../api";
import toast from "react-hot-toast";
import "./PaymentModal.css";

// Initialize Stripe (use publishable key from env or mock for development)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_mock_key"
);

const PaymentForm = ({ orderId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createIntent = async () => {
      try {
        const data = await paymentsAPI.createIntent(orderId);
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to initialize payment"
        );
      }
    };

    createIntent();
  }, [orderId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    try {
      // Handle mock payment (when Stripe is not configured)
      if (clientSecret === "mock_payment_intent_secret") {
        // Simulate payment success
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await paymentsAPI.confirmPayment(orderId, paymentIntentId);
        toast.success("Payment successful!");
        onSuccess();
        return;
      }

      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        toast.error(error.message || "Payment failed");
        setProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        // Confirm payment on backend
        await paymentsAPI.confirmPayment(orderId, paymentIntent.id);
        toast.success("Payment successful!");
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message || "Payment processing failed"
      );
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <h3>Total Amount</h3>
        <p className="amount-value">${parseFloat(amount).toFixed(2)}</p>
      </div>

      <div className="card-element-container">
        <label>Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "var(--text-primary)",
                "::placeholder": {
                  color: "var(--text-secondary)",
                },
              },
              invalid: {
                color: "#dc143c",
              },
            },
          }}
        />
      </div>

      <div className="payment-actions">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-btn"
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="pay-btn"
          disabled={!stripe || processing || !clientSecret}
        >
          {processing ? "Processing..." : `Pay $${parseFloat(amount).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, orderId, amount, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-modal-body">
          <Elements stripe={stripePromise}>
            <PaymentForm
              orderId={orderId}
              amount={amount}
              onSuccess={() => {
                onSuccess();
                onClose();
              }}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

