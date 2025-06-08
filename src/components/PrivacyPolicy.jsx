import React from 'react'
import LegalDoc from "../assets/LegalDocument.jpg"
import Panimg from "../assets/PanRegistration.jpg"

const PrivacyPolicy = () => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <p className='text-4xl p-4 border-b rounded-md '>
        PrivacyPolicy
        </p>
        <div className='m-2'> 
          <img className="mb-2  rounded-md" src={LegalDoc} height="800px" width={"800px"} alt="Legal Documents" srcset="" />
          <img className="mb-2  rounded-md" src={Panimg} height="800px" width={"800px"} alt="Legal Documents" srcset="" />
        </div>

    </div>
    
  )
}

export default PrivacyPolicy
