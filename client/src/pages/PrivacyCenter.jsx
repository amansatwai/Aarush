import React, {useState} from "react";
import "./PrivacyCenter.css";


export default function PrivacyCenter(){


const [privacy,setPrivacy]=useState(

localStorage.getItem("aarush_privacy")==="true"

);


const [hideProfile,setHideProfile]=useState(

localStorage.getItem("hide_profile")==="true"

);


const [hideOnline,setHideOnline]=useState(

localStorage.getItem("hide_online")==="true"

);



const [messageLock,setMessageLock]=useState(

localStorage.getItem("message_lock")==="true"

);






function updateSetting(
key,
value,
setter
){


setter(value);


localStorage.setItem(
key,
value
);


}






return(


<div className="privacy-page">



<h1>
🛡 Privacy Center
</h1>



<p>
Control your Aarush privacy.
</p>






<div className="privacy-card">



<h3>
Emergency Privacy
</h3>


<button

onClick={()=>{

updateSetting(

"aarush_privacy",

!privacy,

setPrivacy

)

}}

>

{

privacy ?

"🟢 Privacy ON"

:

"⚪ Privacy OFF"

}


</button>


</div>









<div className="privacy-card">


<h3>
Profile Visibility
</h3>


<button

onClick={()=>{

updateSetting(

"hide_profile",

!hideProfile,

setHideProfile

)

}}

>


{

hideProfile ?

"Profile Hidden"

:

"Profile Visible"

}


</button>


</div>









<div className="privacy-card">


<h3>
Online Status
</h3>


<button

onClick={()=>{

updateSetting(

"hide_online",

!hideOnline,

setHideOnline

)

}}

>


{

hideOnline ?

"Offline Mode"

:

"Online Visible"

}



</button>


</div>









<div className="privacy-card">


<h3>
Message Privacy
</h3>


<button

onClick={()=>{

updateSetting(

"message_lock",

!messageLock,

setMessageLock

)

}}

>


{

messageLock ?

"Messages Locked"

:

"Messages Open"

}


</button>


</div>







</div>


)

}