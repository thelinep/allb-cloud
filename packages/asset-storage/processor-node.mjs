import {createRequire} from 'node:module';
const require=createRequire(new URL('../../apps/maataa-ui-route-source/package.json',import.meta.url));
export async function decodeLocalImage(bytes,maxPixels){
 const sharp=require('sharp'),image=sharp(bytes,{limitInputPixels:maxPixels,failOn:'warning'}),meta=await image.metadata();
 if(!meta.width||!meta.height||meta.width*meta.height>maxPixels||(meta.pages??1)>1)throw Error('INVALID_IMAGE_DIMENSIONS');
 const decoded=await image.rotate().webp({quality:85}).toBuffer(),derivatives=[];
 for(const [name,width] of [['preview',1280],['thumbnail',320]]){const out=await sharp(decoded).resize({width,withoutEnlargement:true}).webp({quality:80}).toBuffer({resolveWithObject:true});derivatives.push({name,bytes:out.data,width:out.info.width,height:out.info.height});}
 return derivatives;
}
