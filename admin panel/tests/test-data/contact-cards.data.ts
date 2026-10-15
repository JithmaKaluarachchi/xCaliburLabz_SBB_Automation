export const invalidContactEmail='not-an-email';
export const changedPhone=(value:string)=>value.endsWith('0')?`${value.slice(0,-1)}1`:`${value.slice(0,-1)}0`;
export const generatedContactCardData=()=>{const id=Date.now();return{mobile:`+94 77 ${String(id).slice(-3)} ${String(id).slice(-2)} ${String(id).slice(-2)}`,email:`qa.contact.cards+${id}@example.com`,address:`QA Automation Temporary Address ${id}, Colombo`}};
