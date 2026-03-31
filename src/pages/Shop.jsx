import React from 'react';
import { ShoppingBag, Box, Droplet, ArrowRight, Info } from 'lucide-react';

export default function Shop() {
  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light">Shop</h1>
          <p className="text-secondary text-sm mt-xs">Supplies for your protocols</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative">
          <ShoppingBag size={18} />
          <div className="absolute top-0 right-0 w-[10px] h-[10px] bg-accent rounded-full border-2 border-transparent"></div>
        </div>
      </div>

      <div className="glass-panel p-md flex items-start gap-md mt-sm bg-black/5 border-white/10">
        <Info size={20} className="text-secondary flex-shrink-0 mt-[2px]" />
        <p className="text-xs text-secondary leading-relaxed">
          These items are intelligently selected based on your <strong className="text-white font-medium">Recovery Stack</strong> and <strong className="text-white font-medium">Fat Loss Phase 1</strong> to ensure you stay supplied.
        </p>
      </div>

      <div className="flex-col gap-xs">
        <h2 className="text-lg font-medium px-xs">Calculated Cart</h2>
        
        <div className="glass-card flex-col gap-0 p-0 overflow-hidden border-white/20" style={{ padding: 0 }}>
          {/* Cart Item 1 */}
          <div className="flex p-md items-center justify-between border-b border-white/10">
            <div className="flex gap-md items-center">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <Box size={18} className="text-accent" />
              </div>
              <div className="flex-col">
                <span className="text-sm font-medium text-white">BPC-157 (5mg)</span>
                <span className="text-xs text-secondary mt-[2px]">Need 2 vials to finish cycle</span>
              </div>
            </div>
            <div className="flex-col items-end">
              <span className="font-semibold text-sm">$68.00</span>
              <span className="text-[10px] text-secondary">Qty: 2</span>
            </div>
          </div>
          
          {/* Cart Item 2 */}
          <div className="flex p-md items-center justify-between border-b border-white/10 bg-black/5">
            <div className="flex gap-md items-center">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <Droplet size={18} className="text-white" />
              </div>
              <div className="flex-col">
                <span className="text-sm font-medium text-white">Bacteriostatic Water</span>
                <span className="text-xs text-secondary mt-[2px]">30ml bottle</span>
              </div>
            </div>
            <div className="flex-col items-end">
              <span className="font-semibold text-sm">$9.00</span>
              <span className="text-[10px] text-secondary">Qty: 1</span>
            </div>
          </div>

          <div className="p-md flex justify-between items-center bg-white/5">
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">Estimated Total</span>
            <span className="text-2xl font-light">$145.00</span>
          </div>
        </div>
        
        <button className="btn-primary w-full mt-md shadow-lg" style={{ padding: '16px', background: '#1c1c1e' }}>
          Checkout • $145.00
        </button>
      </div>

      <div className="flex-col gap-sm mt-sm">
        <h2 className="text-lg font-medium text-secondary px-xs">Common Supplies</h2>
        
        <div className="flex gap-sm overflow-x-auto hide-scrollbar pb-sm" style={{ margin: '0 -24px', padding: '0 24px' }}>
          <SupplyCard name="U-100 Syringes" count="100 pack" price="$14" />
          <SupplyCard name="Alcohol Prep" count="200 wipes" price="$6" />
          <SupplyCard name="Sharps Bin" count="Small 1qt" price="$8" />
        </div>
      </div>
      
      <div style={{ height: '60px' }}></div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function SupplyCard({ name, count, price }) {
  return (
    <div className="glass-card flex-col justify-between min-w-[130px] flex-shrink-0 border-white/10" style={{ padding: '16px', minHeight: '130px' }}>
      <div className="flex-col">
        <span className="font-medium text-sm leading-tight text-white">{name}</span>
        <span className="text-[11px] text-secondary mt-xs">{count}</span>
      </div>
      <div className="flex justify-between items-center mt-md pt-sm border-t border-white/10">
        <span className="font-medium text-sm text-accent">{price}</span>
        <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
