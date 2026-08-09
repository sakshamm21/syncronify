'use client'
import MapboxComponent from '@/components/MapBox/MapBox';
import React, { useEffect, useState } from 'react'

interface LocateInMapProps {
  params: { eventId: string };
}

const LocateInMap = ({ params }: LocateInMapProps) => {
  const [location,setLocation]=useState<any>({});
  const {eventId}=params;
  // let tempLocation;

  useEffect(()=>{
    const token=localStorage.getItem('token');
    const fetchEvent = async()=>{
      try{
        const response = await fetch(`/api/events/event-details?eventId=${eventId}`,{
          method:'GET',
          headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
          }
        });
        if(!response.ok){
          throw new Error(response.statusText)
        }
        const {data} = await response.json()
        const loc = data.event.location;
        setLocation({
          latitude: loc?.coordinates?.latitude,
          longitude: loc?.coordinates?.longitude,
          name: loc?.locationName,
        });
      }catch(error){
        console.log(error)
      }
    };
    fetchEvent();
    
  },[eventId])
  return (
    <div className='m-1 p-5 text-lg'>
      <h1 className="p-1 text-3xl">{location.name || ''}</h1>
      <div className="w-[90vw] h-[90vh]">
        <MapboxComponent longitude={location.longitude} latitude={location.latitude}/>
      </div>
    </div>
  )
}

export default LocateInMap