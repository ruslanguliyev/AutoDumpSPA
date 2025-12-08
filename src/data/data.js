// src/data/autos.js
import image1 from '../assets/images/Image1.jpeg';
import gWagon from '../assets/images/G-wagon.jpeg';
// import image2 from '../assets/images/Image1_2.jpeg';
// import image3 from '../assets/images/Image1_3.jpeg';
// import image4 from '../assets/images/Image1_4.jpeg';
// import image5 from '../assets/images/Image1_5.jpeg';

export const autos = [
  {
    id: "1",
    brand: "Rolls Royce",
    model: "Cullinan",
    description: "British luxury icon. Owned by BMW. Hand-built perfection.",
    image: image1,
    alt: "Rolls Royce Phantom",
    vehicleType: "car"
  },
  {
    id: "2",
    brand: "Bentley",
    model: "Continental GT",
    description: "660 hp. Handcrafted interior. The grand tourer king.",
    image: [image1],
    alt: "Bentley GT",
    vehicleType: "car"
  },
  {
    id: "3",
    brand: "Mercedes-Benz",
    model: "G-Class",
    description: "Mercedes-Benz G-Class is a luxury SUV that combines off-road capability with high-end comfort and technology.",
    image: [gWagon],
    alt: "Mercedes-Benz G-Class",
    vehicleType: "car"
  },
  {
    id: "4",
    brand: "Bentley",
    model: "Continental GT",
    description: "660 hp. Handcrafted interior. The grand tourer king.",
    image: [image1],
    alt: "Bentley GT",
    vehicleType: "car"
  },

  
];