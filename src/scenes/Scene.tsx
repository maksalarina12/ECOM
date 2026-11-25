import {Component,Suspense,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,RoundedBox,Text,Line,ContactShadows,useGLTF,Html,AdaptiveDpr} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import type {OrbitControls as OrbitImpl} from 'three-stdlib';
import type {ProductModel} from '../data/catalog';
export type Mode='inspect'|'explode'|'xray'|'dimensions'|'materials';
export const layers=[{id:'cover',name:'Quilted Fabric Cover',cm:2,detail:'Kain tenun bertekstur dengan quilting dan edge piping.'},{id:'comfort',name:'Comfort Foam',cm:4,detail:'Lapisan permukaan yang memberikan rasa nyaman.'},{id:'transition',name:'Transition Foam',cm:3,detail:'Menyeimbangkan rasa nyaman dan dukungan inti.'},{id:'springs',name:'Pocket Spring Core',cm:16,detail:'Pegas independen dengan kantong kain individual.'},{id:'base',name:'High-Density Foundation',cm:3,detail:'Lapisan dasar untuk menopang seluruh konstruksi.'}];
function procedural(type:'wood'|'quilt'|'fabric'|'foam',size=512){const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d')!;const base={wood:'#987252',quilt:'#e9e2d5',fabric:'#e2dace',foam:'#e0d6c6'}[type];ctx.fillStyle=base;ctx.fillRect(0,0,size,size);const rand=(i:number)=>(Math.sin(i*129.31+45)*43758.5453)%1;for(let i=0;i<(size<=256?2200:9000);i++){const x=Math.abs(rand(i))*size,y=Math.abs(rand(i+9901))*size;ctx.fillStyle=i%2?'rgba(255,255,255,.07)':'rgba(47,33,18,.05)';ctx.fillRect(x,y,type==='wood'?2:1,type==='wood'?17:2)}if(type==='wood'){for(let i=0;i<250;i++){let x=Math.abs(rand(i+199))*size;ctx.strokeStyle=`rgba(50,27,14,${Math.abs(rand(i+123))*.13})`;ctx.lineWidth=1+Math.abs(rand(i+12))*2;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+12,size*.33,x-9,size*.68,x+4,size);ctx.stroke()}}if(type==='quilt'||type==='fabric'){ctx.lineWidth=.6;ctx.strokeStyle='rgba(87,70,49,.13)';for(let i=0;i<size;i+=5){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,size);ctx.moveTo(0,i);ctx.lineTo(size,i);ctx.stroke()}}if(type==='quilt'){ctx.strokeStyle='rgba(117,98,75,.25)';ctx.lineWidth=2;for(let x=-100;x<size+100;x+=84)for(let y=-100;y<size+100;y+=84){ctx.beginPath();ctx.moveTo(x,y+42);ctx.lineTo(x+42,y);ctx.lineTo(x+84,y+42);ctx.lineTo(x+42,y+84);ctx.closePath();ctx.stroke()}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=size<=256?2:8;return t}
function Springs({w,l,mobile=false}:{w:number;l:number;mobile?:boolean}){const ref=useRef<THREE.InstancedMesh>(null);const spacing=mobile?.14:.095,nx=Math.max(6,Math.floor(w/spacing)),nz=Math.max(9,Math.floor(l/spacing)),count=nx*nz;const geometry=useMemo(()=>{const p:THREE.Vector3[]=[];const steps=mobile?24:45;for(let i=0;i<=steps;i++){const a=i/steps*2*Math.PI*5;p.push(new THREE.Vector3(Math.cos(a)*.025,-.064+i/steps*.128,Math.sin(a)*.025))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p),mobile?54:160,.0027,mobile?3:5,false)},[mobile]);useEffect(()=>{if(!ref.current)return;const dummy=new THREE.Object3D();let k=0;for(let x=0;x<nx;x++)for(let z=0;z<nz;z++){dummy.position.set(-w/2+(x+.5)*w/nx,0,-l/2+(z+.5)*l/nz);dummy.updateMatrix();ref.current.setMatrixAt(k++,dummy.matrix)}ref.current.instanceMatrix.needsUpdate=true},[w,l,nx,nz]);return <instancedMesh ref={ref} args={[geometry,undefined,count]}><meshStandardMaterial color="#777c7c" metalness={.65} roughness={.32}/></instancedMesh>}
function Mattress({w=1.6,l=2,mode='inspect',explode=0,selected,onSelect,fabric='#e9e2d7',showTracking=false,onDetail=()=>{},mobile=false}:{w?:number;l?:number;mode?:Mode;explode?:number;selected?:string|null;onSelect?:(s:string)=>void;fabric?:string;showTracking?:boolean;onDetail?:(s:string)=>void;mobile?:boolean}){const tex=useMemo(()=>({wood:procedural('wood',mobile?256:512),quilt:procedural('quilt',mobile?256:512),fabric:procedural('fabric',mobile?256:512),foam:procedural('foam',mobile?256:512)}),[mobile]);const thickness=[.02,.04,.03,.16,.03];const positions=[.13,.10,.065,-.03,-.125];return <group>{layers.map((layer,i)=>{const y=positions[i]+(2-i)*explode*.14;const active=selected===layer.id;return <group key={layer.id} position={[0,y,0]} onClick={e=>{e.stopPropagation();onSelect?.(layer.id)}}>{i===3?<><RoundedBox args={[w,.16,l]} radius={.026} smoothness={4}><meshStandardMaterial color="#c8c4b7" roughness={.88} transparent={mode==='xray'||mode==='explode'} opacity={mode==='xray'?.10:mode==='explode'?.25:1} depthWrite={mode!=='xray'}/></RoundedBox>{(mode==='explode'||mode==='xray'||active)&&<Springs w={w-.09} l={l-.09} mobile={mobile}/>}</>:<RoundedBox args={[w,thickness[i],l]} radius={Math.min(.012,thickness[i]/3)} smoothness={4}><meshStandardMaterial color={i===0?fabric:['','#eee2cd','#cbbfa4','','#a5a08d'][i]} map={i===0?tex.quilt:tex.foam} roughness={.93} transparent={mode==='xray'} opacity={mode==='xray'?.22:1}/></RoundedBox>}{active&&mode!=='inspect'&&<RoundedBox args={[w+.008,thickness[i]+.012,l+.008]} radius={.012}><meshBasicMaterial color="#a37b4d" wireframe transparent opacity={.3}/></RoundedBox>}{showTracking&&<><Line points={[[w/2+.01,0,0],[w/2+.48,0,0]]} color={active?'#f2bd79':'#dfc095'} lineWidth={active?1.25:.8}/><mesh position={[w/2+.01,0,0]}><sphereGeometry args={[.014,16,12]}/><meshBasicMaterial color="#f2bd79"/></mesh><Html position={[w/2+.62,0,0]} center distanceFactor={5.4} zIndexRange={[20,10]}><button className={`tracked-layer-label ${active?'active':''}`} onClick={(e)=>{e.stopPropagation();onSelect?.(layer.id);onDetail(layer.id)}}><span>0{i+1}</span>{layer.name}</button></Html></>}</group>})}{(mode==='inspect'||mode==='materials')&&<><RoundedBox args={[w+.012,.28,l+.012]} radius={.034} smoothness={5}><meshStandardMaterial color={fabric} map={tex.fabric} roughness={.94}/></RoundedBox><RoundedBox args={[w+.016,.015,l+.016]} radius={.007} smoothness={4} position={[0,.139,0]}><meshStandardMaterial color={fabric} map={tex.quilt} roughness={.92}/></RoundedBox>{[-.122,.12].map(y=><group key={y} position={[0,y,0]}><mesh position={[0,0,l/2+.009]}><boxGeometry args={[w-.04,.005,.007]}/><meshStandardMaterial color="#aa9985"/></mesh><mesh position={[0,0,-l/2-.009]}><boxGeometry args={[w-.04,.005,.007]}/><meshStandardMaterial color="#aa9985"/></mesh></group>)}</>}{mode==='dimensions'&&<><Line points={[[-w/2,-.25,l/2+.13],[w/2,-.25,l/2+.13]]} color="#765d43"/><Line points={[[-w/2-.15,-.25,-l/2],[-w/2-.15,-.25,l/2]]} color="#765d43"/><Line points={[[w/2+.15,-.14,0],[w/2+.15,.14,0]]} color="#765d43"/><Text position={[0,-.25,l/2+.22]} fontSize={.065} color="#67513c">{Math.round(w*100)} cm</Text><Text position={[-w/2-.23,-.25,0]} rotation={[-Math.PI/2,0,Math.PI/2]} fontSize={.065} color="#67513c">{Math.round(l*100)} cm</Text><Text position={[w/2+.24,0,0]} fontSize={.06} color="#67513c">28 cm</Text></>}</group>}
/**
 * Optional licensed GLB scene. Keep the authored mattress construction separately:
 * a decorative furnished bed model cannot truthfully represent the five verified layers.
 * The URL is configurable in Vite via VITE_ECOM_BED_MODEL_URL.
 */
const BED_MODEL_URL = import.meta.env.VITE_ECOM_BED_MODEL_URL || '/models/low-platform-bed.glb';
class AssetBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?this.props.fallback:this.props.children}
}
function LicensedBed({studio=false}:{studio?:boolean}){
  const gltf=useGLTF(BED_MODEL_URL) as {scene:THREE.Group};
  const scene=useMemo(()=>{
    const clone=gltf.scene.clone(true);
    clone.traverse((object: THREE.Object3D)=>{if((object as THREE.Mesh).isMesh){object.castShadow=true;object.receiveShadow=true}});
    const bounds=new THREE.Box3().setFromObject(clone),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    // All measurements are in meters, and the scene remains centered over the platform.
    const scale=Math.min(1.0,1.84/Math.max(size.x,.001),2.12/Math.max(size.z,.001));
    clone.scale.setScalar(scale);
    clone.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    return clone;
  },[gltf.scene]);
  return <group position={[0,studio?-.49:-.69,0]}><primitive object={scene}/></group>
}
function BedroomArchitecture(){return <group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.695,0]} receiveShadow><planeGeometry args={[12,12]}/><meshStandardMaterial color="#c4b9a9" roughness={.92}/></mesh><mesh position={[0,2,-2.1]} receiveShadow><planeGeometry args={[12,6]}/><meshStandardMaterial color="#e0d8cb" roughness={1}/></mesh></group>}
function BedRoom({w,l}:{w:number;l:number}){const wood=useMemo(()=>procedural('wood'),[]);return <group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.69,0]} receiveShadow><planeGeometry args={[12,12]}/><meshStandardMaterial color="#c4b9a9" roughness={.9}/></mesh><mesh position={[0,2,-2.1]} receiveShadow><planeGeometry args={[12,6]}/><meshStandardMaterial color="#e0d8cb" roughness={1}/></mesh><RoundedBox args={[w+.18,.13,l+.2]} radius={.035} position={[0,-.36,0]} castShadow><meshStandardMaterial map={wood} color="#866342" roughness={.79}/></RoundedBox><RoundedBox args={[w+.25,.84,.12]} radius={.06} position={[0,-.07,-l/2-.15]} castShadow><meshStandardMaterial map={wood} color="#8b6846" roughness={.78}/></RoundedBox>{[-1,1].map(x=>[-1,1].map(z=><mesh key={x+'-'+z} position={[x*(w/2-.12),-.53,z*(l/2-.18)]} castShadow><boxGeometry args={[.085,.36,.085]}/><meshStandardMaterial map={wood} color="#7a583e"/></mesh>))}<group position={[0,.21,-l*.27]}>{[-1,1].map(x=><RoundedBox key={x} args={[w*.37,.12,.43]} radius={.055} position={[x*w*.205,0,0]} rotation={[0,0,x*.055]} castShadow><meshStandardMaterial color="#e8e2d8" roughness={.97}/></RoundedBox>)}</group><RoundedBox args={[w*.87,.023,.62]} radius={.011} position={[0,.157,l*.20]} rotation={[-.027,0,0]}><meshStandardMaterial color="#d5cdc1" roughness={.99}/></RoundedBox><group position={[w/2+.50,-.40,-l/2+.13]}><RoundedBox args={[.44,.43,.38]} radius={.02} castShadow><meshStandardMaterial color="#8a6a4c" map={wood}/></RoundedBox><mesh position={[0,.28,0]}><cylinderGeometry args={[.025,.025,.3]}/><meshStandardMaterial color="#aa956f" metalness={.5}/></mesh><mesh position={[0,.53,0]}><cylinderGeometry args={[.135,.20,.23,32,1,true]}/><meshStandardMaterial color="#e7d7bc" side={THREE.DoubleSide} roughness={.85}/></mesh><pointLight position={[0,.43,0]} intensity={.9} color="#ffcb8e" distance={3}/></group><mesh rotation={[-Math.PI/2,0,0]} position={[.25,-.679,.2]}><planeGeometry args={[3.1,3.4]}/><meshStandardMaterial color="#a79b89" roughness={1}/></mesh></group>}
function CameraController({studio,explode,controls,product}:{studio:boolean;explode:number;controls:React.RefObject<OrbitImpl|null>;product:ProductModel}){const {camera,size}=useThreeHook();const ready=useRef(false);const aspect=size.width/Math.max(size.height,1);const fit=Math.max(1,Math.min(1.65,1.12/aspect));useEffect(()=>{const vertical=product==='wardrobe'||product==='lamp';if(!ready.current){camera.position.set(3.3*fit,2.15*fit,3.6*fit);ready.current=true}const base=!studio?{x:3.25,y:2.25,z:3.55}:vertical?{x:2.1,y:1.35,z:4.5}:{x:2.65+explode*.6,y:1.65+explode*.85,z:2.9+explode*.35};const target={x:base.x*fit,y:base.y*fit,z:base.z*fit};gsap.to(camera.position,{...target,duration:1.25,ease:'power2.inOut',onUpdate:()=>controls.current?.update()});if(controls.current)gsap.to(controls.current.target,{x:0,y:vertical?.34:studio?explode*.25:-.07,z:0,duration:1.25,onUpdate:()=>controls.current?.update()})},[studio,explode,camera,controls,fit,product]);return null}
import {useThree as useThreeHook} from '@react-three/fiber';
function StudioSet(){
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.5,0]} receiveShadow>
      <planeGeometry args={[30,30]}/>
      <meshStandardMaterial color="#aaa296" roughness={.86}/>
    </mesh>
    <mesh position={[0,2.7,-3.1]} receiveShadow>
      <planeGeometry args={[14,7]}/>
      <meshStandardMaterial color="#77786f" roughness={.96}/>
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.487,.15]} receiveShadow>
      <circleGeometry args={[2.65,72]}/>
      <meshStandardMaterial color="#81786d" roughness={1}/>
    </mesh>
  </group>
}
function SideTable(){
  const wood=useMemo(()=>procedural('wood'),[]);
  return <group position={[0,-.17,0]}>
    <RoundedBox args={[1.18,.12,.72]} radius={.025} position={[0,.58,0]} castShadow><meshStandardMaterial map={wood} color="#9b7049" roughness={.62}/></RoundedBox>
    <RoundedBox args={[1.04,.72,.64]} radius={.02} position={[0,.18,0]} castShadow><meshStandardMaterial map={wood} color="#825b3c" roughness={.67}/></RoundedBox>
    <mesh position={[0,.32,.333]} castShadow><boxGeometry args={[.96,.31,.025]}/><meshStandardMaterial map={wood} color="#a97c52" roughness={.62}/></mesh>
    <mesh position={[0,.02,.333]} castShadow><boxGeometry args={[.96,.25,.025]}/><meshStandardMaterial map={wood} color="#96704e" roughness={.65}/></mesh>
    {[.32,.02].map(y=><mesh key={y} position={[0,y,.355]} castShadow><sphereGeometry args={[.026,20,16]}/><meshStandardMaterial color="#c6a06a" metalness={.75} roughness={.26}/></mesh>)}
    {[-.43,.43].map(x=><mesh key={x} position={[x,-.31,0]} castShadow><boxGeometry args={[.075,.32,.075]}/><meshStandardMaterial color="#4a3528" roughness={.58}/></mesh>)}
  </group>
}
function GenericProduct({type}:{type:Exclude<ProductModel,'mattress'|'lamp'|'wardrobe'|'bedframe'|'side'>}){
  const wood=useMemo(()=>procedural('wood'),[]);
  const woodMat=<meshStandardMaterial map={wood} color="#8c6342" roughness={.7}/>;
  if(type==='sofa')return <group position={[0,-.17,0]}>
    <RoundedBox args={[2.1,.48,.82]} radius={.13} position={[0,.02,0]} castShadow><meshStandardMaterial color="#a7a398" roughness={.94}/></RoundedBox>
    {[-.53,.53].map(x=><RoundedBox key={x} args={[.96,.18,.73]} radius={.08} position={[x,.31,.02]} castShadow><meshStandardMaterial color="#c1bbb0" roughness={.96}/></RoundedBox>)}
    {[-.58,.58].map(x=><RoundedBox key={x} args={[.82,.55,.18]} radius={.08} position={[x,.52,-.34]} rotation={[.12,0,0]} castShadow><meshStandardMaterial color="#aaa69c" roughness={.95}/></RoundedBox>)}
    {[-1.04,1.04].map(x=><RoundedBox key={x} args={[.18,.57,.83]} radius={.08} position={[x,.12,0]} castShadow><meshStandardMaterial color="#918d83" roughness={.95}/></RoundedBox>)}
  </group>;
  if(type==='chair')return <group position={[0,-.2,0]}>
    <RoundedBox args={[.86,.16,.78]} radius={.055} position={[0,.22,0]} castShadow>{woodMat}</RoundedBox>
    <RoundedBox args={[.78,.92,.13]} radius={.07} position={[0,.73,-.33]} rotation={[-.12,0,0]} castShadow>{woodMat}</RoundedBox>
    {[-.32,.32].map(x=>[-.25,.25].map(z=><mesh key={x+'-'+z} position={[x,-.18,z]} rotation={[z*.12,0,x*.1]} castShadow><cylinderGeometry args={[.035,.048,.72,20]}/>{woodMat}</mesh>))}
  </group>;
  if(type==='coffee')return <group position={[0,-.18,0]}>
    <RoundedBox args={[1.75,.16,.9]} radius={.07} position={[0,.32,0]} castShadow>{woodMat}</RoundedBox>
    {[-.66,.66].map(x=><mesh key={x} position={[x,-.02,0]} castShadow><cylinderGeometry args={[.055,.075,.7,24]}/>{woodMat}</mesh>)}
  </group>;
  if(type==='rattan')return <group position={[0,.1,0]}>
    <mesh position={[0,.6,0]} castShadow><cylinderGeometry args={[.28,.63,.72,48,1,true]}/><meshStandardMaterial color="#c89455" roughness={.76} side={THREE.DoubleSide} wireframe/></mesh>
    <mesh position={[0,.98,0]}><cylinderGeometry args={[.025,.025,.75,16]}/><meshStandardMaterial color="#4f4032"/></mesh>
    <pointLight position={[0,.55,0]} intensity={8} distance={4} color="#ffbd72"/>
  </group>;
  if(type==='vase')return <group position={[0,-.2,0]}>
    <mesh castShadow><sphereGeometry args={[.43,48,36]}/><meshStandardMaterial color="#c9b39a" roughness={.92}/></mesh>
    <mesh position={[0,.39,0]} castShadow><cylinderGeometry args={[.19,.28,.45,48]}/><meshStandardMaterial color="#c9b39a" roughness={.92}/></mesh>
    <mesh position={[0,.75,0]} rotation={[0,0,.22]}><cylinderGeometry args={[.012,.012,.9,10]}/><meshStandardMaterial color="#56604b"/></mesh>
    <mesh position={[-.17,.94,0]} rotation={[0,0,-.7]}><sphereGeometry args={[.13,.25,.08,24]}/><meshStandardMaterial color="#73806a"/></mesh>
  </group>;
  return <group position={[0,-.2,0]}>
    <mesh position={[-.48,.05,0]} castShadow><sphereGeometry args={[.38,32,24]}/>{woodMat}</mesh>
    <mesh position={[.05,.1,0]} castShadow><coneGeometry args={[.28,.85,32]}/>{woodMat}</mesh>
    <mesh position={[.5,.04,0]} rotation={[0,0,.45]} castShadow><torusGeometry args={[.28,.12,20,48]}/>{woodMat}</mesh>
  </group>
}
function SceneContents({studio,mode,explode,width,length,selected,onSelect,fabric,product,showTracking,onDetail,mobile}:{studio:boolean;mode:Mode;explode:number;width:number;length:number;selected:string|null;onSelect:(s:string)=>void;fabric:string;product:ProductModel;showTracking:boolean;onDetail:(s:string)=>void;mobile:boolean}){
  const controls=useRef<OrbitImpl>(null);
  return <>
    <color attach="background" args={[studio?'#4d504a':'#d9cfc0']}/>
    <fog attach="fog" args={[studio?'#4d504a':'#d9cfc0',6.5,16]}/>
    <hemisphereLight args={[studio?'#d8e0df':'#fff4df',studio?'#282620':'#5c554c',studio?.72:1.1]}/>
    <spotLight position={[-4.5,7,4.5]} intensity={studio?112:75} angle={.42} penumbra={.72} distance={16} color="#ffbd7a" castShadow shadow-mapSize={mobile?[1024,1024]:[2048,2048]} shadow-bias={-.00018}/>
    <spotLight position={[4.8,4.5,2.5]} intensity={studio?76:42} angle={.48} penumbra={.88} distance={14} color="#8fb7cb"/>
    <spotLight position={[0,5,-4]} intensity={studio?66:30} angle={.55} penumbra={.78} distance={13} color="#f6d1a5"/>
    <pointLight position={[-3,1.4,-1]} intensity={studio?14:4} distance={7} color="#f09a55"/>
    {studio&&<pointLight position={[3,-.1,1]} intensity={8} distance={5} color="#7395a4"/>}
    {studio?<StudioSet/>:<BedroomArchitecture/>}
    {product==='mattress'
      ?(!studio
        ?<AssetBoundary fallback={<><BedRoom w={width} l={length}/><group position={[0,-.03,0]}><Mattress w={width} l={length} fabric={fabric}/></group></>}>
          <Suspense fallback={<group position={[0,-.03,0]}><Mattress w={width} l={length} fabric={fabric}/></group>}><LicensedBed/></Suspense>
        </AssetBoundary>
        :<Mattress w={width} l={length} mode={mode} explode={explode} selected={selected} onSelect={onSelect} fabric={fabric} showTracking={showTracking} onDetail={onDetail} mobile={mobile}/>)
      :product==='lamp'?<Lamp/>:product==='wardrobe'?<Wardrobe/>:product==='side'?<SideTable/>
      :product==='bedframe'?<AssetBoundary fallback={<BedRoom w={width} l={length}/>}><Suspense fallback={<BedRoom w={width} l={length}/>}><LicensedBed studio/></Suspense></AssetBoundary>
      :<GenericProduct type={product}/>}
    {!mobile&&<ContactShadows key={`${mode}-${Math.round(explode*10)}`} position={[0,-.485,0]} opacity={studio?.56:.42} scale={7} blur={mobile?2.8:2.2} far={3.2} resolution={mobile?256:512} frames={20}/>}
    <OrbitControls ref={controls} enablePan={false} minDistance={2.15} maxDistance={7} maxPolarAngle={Math.PI*.47} minPolarAngle={.35} enableDamping dampingFactor={.08} rotateSpeed={mobile ? .72 : 1} zoomSpeed={mobile ? .72 : 1}/>
    <CameraController studio={studio} explode={explode} controls={controls} product={product}/>
    <AdaptiveDpr pixelated/>
  </>
}
function Lamp(){const [on,setOn]=useState(true);return <group onClick={()=>setOn(v=>!v)}><mesh position={[0,-.22,0]}><cylinderGeometry args={[.19,.23,.12,32]}/><meshStandardMaterial color="#75543b" roughness={.7}/></mesh><mesh position={[0,.13,0]}><cylinderGeometry args={[.026,.026,.65]}/><meshStandardMaterial color="#af996f" metalness={.4}/></mesh><mesh position={[0,.50,0]}><cylinderGeometry args={[.25,.36,.49,40,1,true]}/><meshStandardMaterial color={on?'#f7d9a8':'#d4c5ae'} roughness={.88} side={THREE.DoubleSide} emissive={on?'#e1a05d':'#000000'} emissiveIntensity={on?.16:0}/></mesh>{on&&<pointLight position={[0,.49,0]} intensity={3} distance={3} color="#ffd0a0"/>}</group>}
function Wardrobe(){const [open,setOpen]=useState(false);const doorA=useRef<THREE.Group>(null),doorB=useRef<THREE.Group>(null);useFrame((_,dt)=>{if(doorA.current)doorA.current.rotation.y=THREE.MathUtils.damp(doorA.current.rotation.y,open?-.62:0,5,dt);if(doorB.current)doorB.current.rotation.y=THREE.MathUtils.damp(doorB.current.rotation.y,open?.62:0,5,dt)});return <group onClick={()=>setOpen(x=>!x)}><RoundedBox args={[1.3,2,.68]} radius={.02}><meshStandardMaterial color="#74543a" roughness={.76}/></RoundedBox><mesh position={[0,0,.36]}><boxGeometry args={[1.18,1.85,.05]}/><meshStandardMaterial color="#b99a73"/></mesh>{[-.4,.4].map(y=><mesh key={y} position={[0,y,.40]}><boxGeometry args={[1.1,.025,.5]}/><meshStandardMaterial color="#5a422f"/></mesh>)}{[-1,1].map((side,i)=><group key={side} ref={i===0?doorA:doorB} position={[side*.645,0,.39]}><RoundedBox args={[.64,1.94,.055]} position={[-side*.32,0,0]} radius={.012}><meshStandardMaterial color="#987653" roughness={.73}/></RoundedBox><mesh position={[-side*.57,0,.05]}><boxGeometry args={[.025,.21,.03]}/><meshStandardMaterial color="#c7a678" metalness={.6}/></mesh></group>)}</group>}
export default function Scene({studio=false,mode='inspect',explode=0,width=1.6,length=2,selected=null,onSelect=()=>{},fabric='#e9e2d7',product='mattress',showTracking=false,onDetail=()=>{}}:{studio?:boolean;mode?:Mode;explode?:number;width?:number;length?:number;selected?:string|null;onSelect?:(s:string)=>void;fabric?:string;product?:ProductModel;showTracking?:boolean;onDetail?:(s:string)=>void}){const [error,setError]=useState(false);const mobile=typeof window!=='undefined'&&window.matchMedia('(max-width: 800px), (pointer: coarse)').matches;if(error)return <div className="scene-fallback">Tampilan 3D tidak tersedia di perangkat ini. Produk tetap bisa dibeli melalui katalog.</div>;return <div className={`canvas-wrap ${studio?'cinematic-canvas':''}`}><Canvas shadows={!mobile} dpr={mobile?[.65,1]:[.85,1.75]} gl={{antialias:!mobile,powerPreference:'high-performance',preserveDrawingBuffer:!mobile}} camera={{fov:37,position:[3.25,2.25,3.55],near:.05,far:100}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=studio?.94:1.08;gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.domElement.style.touchAction='none';gl.domElement.addEventListener('webglcontextlost',()=>setError(true))}} fallback={<div className="scene-fallback">WebGL tidak tersedia.</div>}><Suspense fallback={null}><SceneContents studio={studio} mode={mode} explode={explode} width={width} length={length} selected={selected} onSelect={onSelect} fabric={fabric} product={product} showTracking={showTracking} onDetail={onDetail} mobile={mobile}/></Suspense></Canvas></div>}
