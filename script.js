
const f=document.getElementById('f'),src=document.getElementById('src'),dst=document.getElementById('dst');
const s=document.getElementById('s');
const sc=src.getContext('2d'), dc=dst.getContext('2d');
let ready=false;
f.onchange=e=>{
 let img=new Image();
 img.onload=()=>{
  src.width=dst.width=img.width; src.height=dst.height=img.height;
  sc.drawImage(img,0,0); gen(); ready=true;
 };
 img.src=URL.createObjectURL(e.target.files[0]);
};
s.oninput=()=>ready&&gen();
function grayAt(g,x,y,w,h){
 x=Math.max(0,Math.min(w-1,x)); y=Math.max(0,Math.min(h-1,y));
 let i=(y*w+x)*4; return (g[i]+g[i+1]+g[i+2])/3;
}
function gen(){
 let id=sc.getImageData(0,0,src.width,src.height),g=id.data;
 let out=dc.createImageData(src.width,src.height),o=out.data,k=+s.value;
 for(let y=0;y<src.height;y++)for(let x=0;x<src.width;x++){
  let gx=
   -grayAt(g,x-1,y-1,src.width,src.height)+grayAt(g,x+1,y-1,src.width,src.height)
  -2*grayAt(g,x-1,y,src.width,src.height)+2*grayAt(g,x+1,y,src.width,src.height)
  -grayAt(g,x-1,y+1,src.width,src.height)+grayAt(g,x+1,y+1,src.width,src.height);
  let gy=
   -grayAt(g,x-1,y-1,src.width,src.height)-2*grayAt(g,x,y-1,src.width,src.height)-grayAt(g,x+1,y-1,src.width,src.height)
   +grayAt(g,x-1,y+1,src.width,src.height)+2*grayAt(g,x,y+1,src.width,src.height)+grayAt(g,x+1,y+1,src.width,src.height);
  let nx=-gx*k/255, ny=-gy*k/255, nz=1, l=Math.hypot(nx,ny,nz); nx/=l;ny/=l;nz/=l;
  let i=(y*src.width+x)*4;
  o[i]=(nx*0.5+0.5)*255; o[i+1]=(ny*0.5+0.5)*255; o[i+2]=(nz*0.5+0.5)*255; o[i+3]=255;
 }
 dc.putImageData(out,0,0);
}
document.getElementById('d').onclick=()=>{
 let a=document.createElement('a');a.href=dst.toDataURL('image/png');a.download='normal_map.png';a.click();
};
