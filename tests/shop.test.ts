import {beforeEach,describe,it,expect} from 'vitest';
import {useShop,total} from '../src/store/shop';

describe('local demo commerce',()=>{
  beforeEach(()=>useShop.getState().reset());
  it('adds a variant and calculates totals',()=>{
    useShop.getState().add('rest','queen');
    expect(total(useShop.getState().cart,useShop.getState().products)).toBe(2450000);
  });
  it('updates cart quantities and supports removal',()=>{
    useShop.getState().add('rest','queen');useShop.getState().change('rest','queen',1);
    expect(useShop.getState().cart[0].qty).toBe(2);
    useShop.getState().remove('rest','queen');expect(useShop.getState().cart).toHaveLength(0);
  });
  it('persists simulated order and debits inventory on confirmation',()=>{
    useShop.getState().add('rest','queen');
    const id=useShop.getState().checkout('Demo User','demo@example.com','Jl. Contoh No. 1, Indonesia');
    expect(useShop.getState().orders[0].id).toBe(id);
    expect(useShop.getState().cart).toHaveLength(0);
    useShop.getState().status(id,'Confirmed');
    expect(useShop.getState().variantStock.queen).toBe(11);
  });
});
