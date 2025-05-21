import React from 'react';
import '../../CSS/SplashScreeen/splashScreen.css'; // CSS separado

import logo from '../../imgs/logo.png'

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">


        <img src={logo} alt="" />


                <div className="loading">
                                 <div class="c-loader"></div>
                </div>


      </div>
    </div>
  );
};

export default SplashScreen;