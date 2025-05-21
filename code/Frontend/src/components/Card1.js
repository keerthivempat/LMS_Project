import React from 'react';
import { motion } from 'framer-motion';
import CommonButton from './CommonButton.js'

export const Card = ({id,contact,image,name, description }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-[#FFFCF4] rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:b-l-8 transition-shadow duration-300"
    >
     
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <div className="flex p-1">
        <img className = "flex h-10 w-10" src = "bow2.png" style={{scale:"1"}}></img>
        <h3 className="text-[#57321A] text-xl font-bold relative group tm-1">
          {name}
          <span className="block h-0.5 tm-5 bg-[#57321A] absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-300"></span>
        </h3>
        </div>
        <p className="text-gray-600">{description}</p>
        {/* <p className="text-gray-600">{contact}</p> */}
        <CommonButton onClick = {()=>{
          window.location.href = `/organisations/${id}`
        }}>Learn More</CommonButton>
      </div>
      
    </motion.div>
  );
};

export default Card;