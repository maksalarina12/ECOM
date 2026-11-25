export type ProductModel='mattress'|'lamp'|'wardrobe'|'bedframe'|'side'|'sofa'|'chair'|'coffee'|'rattan'|'vase'|'craft';
export type Product={id:string;name:string;category:'Sleep'|'Living'|'Craft';subtitle:string;price:number;stock:number;material:string;dimensions:string;description:string;image:string;model?:ProductModel;};
export type Variant={id:string;label:string;width:number;length:number;price:number;stock:number};
export const variants:Variant[]=[{id:'single',label:'Single',width:90,length:200,price:1750000,stock:14},{id:'double',label:'Double',width:140,length:200,price:2190000,stock:9},{id:'queen',label:'Queen',width:160,length:200,price:2450000,stock:12},{id:'king',label:'King',width:180,length:200,price:2890000,stock:7}];
const raw:[string,string,Product['category'],number,number,string,string,string,string,Product['model']?][]=[
['rest','ECOM REST','Sleep',2450000,42,'Hybrid Mattress','Woven textile · Comfort foam · Transition foam · Pocket springs · HD foam','160 × 200 × 28 cm','Pahami tiap lapisan kasur hybrid dengan inspeksi 3D mendetail.','mattress'],
['frame','Forma Bed','Sleep',3790000,7,'Walnut Bed Frame','Walnut finish','170 × 210 × 95 cm','Rangka tempat tidur dengan detail craftsmanship.','bedframe'],
['side','Noma Side','Sleep',840000,16,'Bedside Table','Oak finish','45 × 38 × 52 cm','Penyimpanan ringkas dalam material natural.','side'],
['glow','Still Lamp','Sleep',590000,24,'Crafted Table Light','Linen shade · Wood base','24 × 24 × 42 cm','Pencahayaan lembut dan terukur.','lamp'],
['sofa','Arc Modular','Living',6800000,4,'Modular Sofa','Woven upholstery · Wood frame','218 × 88 × 76 cm','Sofa kontemporer modular.','sofa'],
['chair','Leno Chair','Living',1290000,13,'Solid Wood Chair','Teak finish','49 × 54 × 78 cm','Kursi berbentuk organik.','chair'],
['coffee','Aalto Low','Living',1690000,11,'Coffee Table','Solid wood','110 × 60 × 38 cm','Meja kayu rendah dengan siluet kuat.','coffee'],
['wardrobe','Atelier Wardrobe','Living',4900000,5,'Two-Door Cabinet','Walnut wood finish','120 × 60 × 195 cm','Eksplorasi pintu dan kompartemen lemari.','wardrobe'],
['rattan','Rumi Pendant','Craft',790000,9,'Rattan Pendant','Natural rattan','42 × 42 × 38 cm','Lampu gantung berbahan anyaman rotan.','rattan'],
['vase','Terra Vessel','Craft',320000,25,'Ceramic Vase','Handmade ceramic','18 × 18 × 29 cm','Keramik artisan dengan permukaan matte.','vase'],
['craft','Hara Objects','Craft',210000,18,'Carved Wood Objects','Reclaimed wood','Various','Dekorasi kayu hasil ukiran.','craft']];
export const seedProducts:Product[]=raw.map(([id,name,category,price,stock,subtitle,material,dimensions,description,model])=>({id,name,category,price,stock,subtitle,material,dimensions,description,image:id,model}));
export const formatIDR=(value:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
export const productPrice=(product:Product,variant:string)=>product.id==='rest'?(variants.find(v=>v.id===variant)?.price??2450000):product.price;
