import {describe,it,expect} from 'vitest';
import {seedProducts,variants,productPrice,formatIDR} from '../src/data/catalog';

describe('ECOM catalog invariants',()=>{
  it('keeps sample product ids unique',()=>expect(new Set(seedProducts.map(p=>p.id)).size).toBe(seedProducts.length));
  it('has four mattress variants',()=>expect(variants.map(v=>v.width)).toEqual([90,140,160,180]));
  it('derives the correct queen price',()=>expect(productPrice(seedProducts[0],'queen')).toBe(2450000));
  it('formats Indonesian rupiah',()=>expect(formatIDR(2450000)).toContain('2.450.000'));
  it('keeps quantities nonnegative in seed',()=>expect(seedProducts.every(p=>p.stock>=0&&p.price>=0)).toBe(true));
});
