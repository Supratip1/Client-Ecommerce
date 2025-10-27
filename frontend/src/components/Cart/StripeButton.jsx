import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import API_ENDPOINTS from '../../config/api.js';

// Fail fast if publishable key is missing - no fallback keys
const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!pk) {
  throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
}
console.log('Loading Stripe with publishable key:', pk ? 'pk_test_***' : 'NOT_SET');
console.log('Environment variable:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT_SET');
const stripePromise = loadStripe(pk);

function CheckoutForm({ amount, onSuccess, onError, items, shippingAddress }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      console.log('Creating payment intent for amount:', amount);
      
      // Validate required shipping address fields
      if (!shippingAddress?.postalCode || shippingAddress.postalCode.trim() === '') {
        onError('Please enter a valid postal code');
        setLoading(false);
        return;
      }
      
      if (!shippingAddress?.country || shippingAddress.country.trim() === '') {
        onError('Please enter a valid country');
        setLoading(false);
        return;
      }
      
      // Validate postal code format based on country
      const postalCode = shippingAddress.postalCode.trim();
      const country = shippingAddress.country.trim().toUpperCase();
      
      if (country === 'US' && postalCode.length !== 5) {
        onError('Please enter a valid 5-digit US postal code');
        setLoading(false);
        return;
      }
      
      if (country === 'IN' || country === 'INDIA') {
        if (postalCode.length !== 6) {
          onError('Please enter a valid 6-digit Indian postal code');
          setLoading(false);
          return;
        }
      }
      
      // Step 1: Call your backend to create PaymentIntent
      const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("userToken")}`
        },
        body: JSON.stringify({ 
          amount: amount, // amount in dollars
          currency: 'usd' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const responseData = await response.json();
      console.log('Payment intent data:', responseData);
      const { clientSecret, paymentIntentId, livemode, amount: piAmount } = responseData;
      
      // Log payment intent details for debugging
      console.log('Payment Intent Details:', {
        id: paymentIntentId,
        livemode: livemode,
        piAmount: piAmount,
        clientSecret: clientSecret
      });

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm the payment with Stripe.js (NOT direct API call)
      console.log('About to confirm payment with Stripe.js using clientSecret:', clientSecret ? 'pi_***_secret_***' : 'NOT_SET');
      
      // Normalize country code to 2-letter ISO format
      let countryCode = shippingAddress?.country?.trim().toUpperCase() || 'US';
      if (countryCode === 'INDIA') countryCode = 'IN';
      if (countryCode === 'USA' || countryCode === 'UNITED STATES') countryCode = 'US';
      
      const billingDetails = {
        name: `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim(),
        phone: shippingAddress?.phone || '',
        address: {
          line1: shippingAddress?.address || '',
          city: shippingAddress?.city || '',
          postal_code: shippingAddress?.postalCode?.trim() || '',
          country: countryCode
        }
      };
      
      console.log('Billing details:', billingDetails);
      console.log('Using stripe.confirmCardPayment - this should NOT make direct API calls to api.stripe.com');
      console.log('Stripe object:', stripe);
      console.log('Client secret:', clientSecret ? 'pi_***_secret_***' : 'NOT_SET');
      
      // Use the same Stripe instance that created the Elements
      const cardElement = elements.getElement(CardElement);
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      });

      if (result.error) {
        console.error('Payment failed:', result.error);
        
        // Handle specific Stripe errors
        if (result.error.code === 'incomplete_zip') {
          onError('Please enter a valid postal code (e.g., 12345 for US or 700034 for India)');
        } else if (result.error.code === 'incomplete_cvc') {
          onError('Please enter a valid CVC code');
        } else if (result.error.code === 'incomplete_expiry') {
          onError('Please enter a valid expiry date');
        } else if (result.error.code === 'incomplete_number') {
          onError('Please enter a valid card number');
        } else {
          onError(result.error.message);
        }
        setLoading(false);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', result.paymentIntent);
        
        // Step 3: Call backend to create order (payment already confirmed by Stripe)
        try {
          const pi = result.paymentIntent;
          
          // Extract required fields for Order schema
          const totalPrice = (pi.amount ?? 0) / 100; // Convert cents to dollars
          const paymentMethod = pi.payment_method_types?.[0] || 'card';
          
          console.log('Sending order data:', {
            paymentIntentId: pi.id,
            totalPrice,
            paymentMethod,
            currency: pi.currency,
            items: items?.length || 0,
            shippingAddress: shippingAddress ? 'provided' : 'missing'
          });
          
          console.log('Full shippingAddress object:', shippingAddress);
          
          const confirmResponse = await fetch(API_ENDPOINTS.CONFIRM_PAYMENT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("userToken")}`
            },
            body: JSON.stringify({
              paymentIntentId: pi.id,
              totalPrice,                     // ✅ required by Order model
              paymentMethod,                  // ✅ required by Order model
              currency: pi.currency,          // optional but useful
              items: items,
              shippingAddress: shippingAddress
            })
          });

          if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            throw new Error(errorData.message || 'Order creation failed');
          }

          const confirmData = await confirmResponse.json();
          console.log('Payment confirmation response:', confirmData);

          if (confirmData.success) {
            onSuccess(result.paymentIntent);
          } else {
            throw new Error(confirmData.message || 'Order creation failed');
          }
        } catch (confirmError) {
          console.error('Order creation error:', confirmError);
          onError('Payment succeeded but order creation failed. Please contact support.');
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error('Payment error:', error);
      onError(error.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-white focus-within:border-[#635BFF] focus-within:ring-1 focus-within:ring-[#635BFF] transition-all duration-200">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
                padding: '12px',
              },
              invalid: {
                color: '#e25950',
                iconColor: '#e25950',
              },
              complete: {
                color: '#00d924',
                iconColor: '#00d924',
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-[#635BFF] to-[#5A52E5] text-white py-3 px-6 rounded-lg font-medium hover:from-[#5A52E5] hover:to-[#4C46D9] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            {/* Official Stripe Logo */}
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.274 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.407-2.354 1.407-1.905 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
            </svg>
            Pay with Stripe
          </>
        )}
      </button>
    </form>
  );
}

const StripeButton = ({ amount, onSuccess, onError, items, shippingAddress }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError} 
        items={items}
        shippingAddress={shippingAddress}
      />
    </Elements>
  );
};

export default StripeButton;
