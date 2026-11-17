
import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { useGetUserCouponQuery } from '../features/couponApi';

function CouponCard() {
  const couponRef = useRef(null);

  
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  
  const {
    data: coupon,
    isLoading,
    isError,
  } = useGetUserCouponQuery(user?.user_id, {
    skip: !user?.user_id,
  });

  const downloadCoupon = async () => {
    if (!couponRef.current) return;

    try {
      const image = await toPng(couponRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `Cinema-Coupon-${coupon.coupon_code}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Coupon download failed:', error);
      alert('Unable to download coupon. Please try again.');
    }
  };

  
  if (!user?.user_id) {
    return (
      <div className="container py-5 text-center">
        <h4>Please login to view your coupon.</h4>
      </div>
    );
  }


  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading your coupon...</p>
      </div>
    );
  }

 
  if (isError || !coupon) {
    return (
      <div className="container py-5 text-center">
        <h4>No coupon available</h4>
        <p className="text-muted">
          Your reward coupon will appear here after your first successful booking.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="text-center mb-4">
        <h2 className="fw-bold">My Reward Coupon</h2>
        <p className="text-muted">
          Enjoy your special discount on your next booking!
        </p>
      </div>

      <div
        ref={couponRef}
        style={{
          maxWidth: '550px',
          margin: 'auto',
          padding: '35px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #172554, #1e3a8a)',
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          border: '5px solid #fbbf24',
        }}
      >
        <h3 style={{ letterSpacing: '3px', fontWeight: 'bold' }}>
          CINEMA REWARDS
        </h3>

        <p style={{ marginTop: '20px', color: '#dbeafe' }}>
          SPECIAL OFFER FOR YOU
        </p>

        <h1
          style={{
            fontSize: '65px',
            fontWeight: 'bold',
            color: '#facc15',
            margin: '10px 0',
          }}
        >
          {coupon.discount_percentage}% OFF
        </h1>

        <h4>YOUR NEXT BOOKING</h4>

        <hr style={{ borderColor: '#ffffff' }} />

        <p style={{ marginBottom: '8px' }}>
          Congratulations, {user.name || 'Valued Customer'}!
        </p>

        <p style={{ color: '#dbeafe' }}>
          Your exclusive coupon code
        </p>

        <div
          style={{
            background: '#ffffff',
            color: '#172554',
            padding: '15px',
            borderRadius: '10px',
            fontSize: '25px',
            fontWeight: 'bold',
            letterSpacing: '3px',
          }}
        >
          {coupon.coupon_code}
        </div>

        <p style={{ marginTop: '25px', fontSize: '13px' }}>
          * One-time use only
        </p>

        <p style={{ fontSize: '12px', color: '#dbeafe' }}>
          Thank you for choosing our Cinema Booking System!
        </p>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-primary px-4 py-2"
          onClick={downloadCoupon}
          disabled={coupon.status !== 'Available'}
        >
          <i className="bi bi-download me-2"></i>
          Download Coupon PNG
        </button>
      </div>

      {coupon.status !== 'Available' && (
        <p className="text-center text-danger mt-3">
          This coupon is no longer available.
        </p>
      )}

    </div>
  );
}

export default CouponCard;
