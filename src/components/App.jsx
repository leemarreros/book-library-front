import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import Election from '../pages/Election';
import Library from '../pages/Library';
import Home from '../pages/Home';

import Header from './layout/Header';
import Footer from './layout/Footer';

function App() {
  const { provider } = configureChains([polygonMumbai], [publicProvider()]);

  const client = createClient({
    provider,
    autoConnect: true,
  });

  return (
    <BrowserRouter>
      <WagmiConfig client={client}>
        <div className="wrapper">
          <Header />
          <div className="main">
            <Routes>
              <Route path="/" element={<Library />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </WagmiConfig>
    </BrowserRouter>
  );
}

export default App;
