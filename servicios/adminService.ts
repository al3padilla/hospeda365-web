export type EstadoHabitacion = "AVAILABLE" | "OCCUPIED" | "CLEANING";
export type EstadoReserva = "PENDING" | "CONFIRMED" | "REJECTED";
export type EstadoPago = "PENDING" | "APPROVED" | "REJECTED";

export type HabitacionAdmin = { id:string; title:string; price:number; status:EstadoHabitacion };
export type ReservaAdmin = { id:string; guestName:string; roomId:string; roomTitle:string; checkIn:string; checkOut:string; amount:number; status:EstadoReserva; paymentStatus:EstadoPago; proof:string };
type AdminData={reservations:ReservaAdmin[];rooms:HabitacionAdmin[]};

const wait=(ms=100)=>new Promise(r=>setTimeout(r,ms));
const KEY="hospeda365_admin_crud_v1";
const seed:AdminData={reservations:[
{id:"RES-4500",guestName:"Jonathan Merino",roomId:"basica",roomTitle:"Básica",checkIn:"2026-09-25",checkOut:"2026-09-28",amount:258,status:"CONFIRMED",paymentStatus:"APPROVED",proof:"Comprobante_RES4500.jpg"},
{id:"RES-4501",guestName:"Marlene Servando",roomId:"intermedia",roomTitle:"Intermedia",checkIn:"2026-09-27",checkOut:"2026-09-30",amount:387,status:"PENDING",paymentStatus:"PENDING",proof:"Comprobante_RES4501.jpg"},
{id:"RES-4502",guestName:"Alejandra Padilla",roomId:"vip",roomTitle:"VIP",checkIn:"2026-10-02",checkOut:"2026-10-05",amount:837,status:"CONFIRMED",paymentStatus:"APPROVED",proof:"Comprobante_RES4502.jpg"}],rooms:[
{id:"basica",title:"Básica",price:89,status:"OCCUPIED"},{id:"intermedia",title:"Intermedia",price:129,status:"AVAILABLE"},{id:"familiar",title:"Familiar",price:189,status:"AVAILABLE"},{id:"kids",title:"Kids",price:199,status:"AVAILABLE"},{id:"vip",title:"VIP",price:279,status:"CLEANING"},{id:"platinum",title:"Platinum",price:399,status:"AVAILABLE"}]};
function cloneSeed(){return JSON.parse(JSON.stringify(seed)) as AdminData}
function load():AdminData{if(typeof window==="undefined")return cloneSeed();try{const x=localStorage.getItem(KEY);return x?JSON.parse(x):cloneSeed()}catch{return cloneSeed()}}
function save(x:AdminData){localStorage.setItem(KEY,JSON.stringify(x));return x}
export const adminService={
 async getData(){await wait();return load()},
 async createReservation(input:Omit<ReservaAdmin,"id"|"status"|"paymentStatus">){await wait();const d=load();const n=Math.max(4502,...d.reservations.map(x=>Number(x.id.replace(/\D/g,""))||0))+1;const r:ReservaAdmin={...input,id:`RES-${n}`,status:"PENDING",paymentStatus:"PENDING"};d.reservations.unshift(r);save(d);return r},
 async updateReservation(id:string,input:Partial<ReservaAdmin>){await wait();const d=load();d.reservations=d.reservations.map(r=>r.id===id?{...r,...input}:r);save(d)},
 async deleteReservation(id:string){await wait();const d=load();d.reservations=d.reservations.filter(r=>r.id!==id);save(d)},
 async setPayment(id:string,value:EstadoPago){await wait();const d=load();d.reservations=d.reservations.map(r=>r.id===id?{...r,paymentStatus:value,status:value==="APPROVED"?"CONFIRMED":value==="REJECTED"?"REJECTED":r.status}:r);save(d)},
 async setRoomStatus(id:string,status:EstadoHabitacion){await wait();const d=load();d.rooms=d.rooms.map(r=>r.id===id?{...r,status}:r);save(d)}
};
