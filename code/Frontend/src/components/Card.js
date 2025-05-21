import React from 'react';

const Card = ({
  imageUrl = "/api/placeholder/400/300",
  category = "Premium Collection",
  title = "Handcrafted Elegance",
  description = "Discover our carefully curated selection of artisanal pieces.",
}) => {
  return (
    <div className="w-64 bg-[#FFFCF4] rounded-xl overflow-hidden shadow-sm
                    transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image section */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 
                     group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#57321A]/20 transition-opacity duration-300 
                      group-hover:opacity-0" />
        
        {/* Category tag */}
        <div className="absolute top-6 left-6 transform -translate-y-full opacity-0 
                      transition-all duration-300 group-hover:translate-y-0 
                      group-hover:opacity-100">
          <span className="bg-[#EFC815] text-[#57321A] px-4 py-2 rounded-full 
                         font-medium">
            {category}
          </span>
        </div>
      </div>
      {/* Content section */}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm text-[#57321A]/80 mb-6">{description}</p>
        {/* Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 px-6 py-3 bg-[#57321A] text-[#FFFCF4] 
                           rounded-lg transition-all duration-300 
                           hover:bg-[#EFC815] hover:text-[#57321A]">
            View Details
          </button>
          <button className="px-6 py-3 border-2 border-[#57321A] text-[#57321A] 
                           rounded-lg transition-all duration-300 
                           hover:border-[#EFC815] hover:text-[#EFC815]">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;