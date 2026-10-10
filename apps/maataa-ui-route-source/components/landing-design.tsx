'use client';
import {useDesign} from './design-provider';
export function useLandingDesign(_path:string){const design=useDesign();return design.configured?design:null;}
