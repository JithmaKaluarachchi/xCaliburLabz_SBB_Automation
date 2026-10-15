import {expect,Locator,Page} from '@playwright/test';
export const shippingHeaders=['Name','Price','ETA','Status','Actions'] as const;
export class ShippingPage{
 readonly heading:Locator;readonly description:Locator;readonly methodsTab:Locator;readonly zonesTab:Locator;
 constructor(readonly page:Page){this.heading=page.getByRole('heading',{name:'Shipping',exact:true});this.description=page.getByText('Delivery methods and zones.',{exact:true});this.methodsTab=page.getByRole('tab',{name:'Methods',exact:true});this.zonesTab=page.getByRole('tab',{name:'Zones',exact:true});}
 async open(){const r=await this.page.goto('/admin/shipping',{waitUntil:'domcontentloaded'});expect(r?.ok(),`Shipping returned ${r?.status()}`).toBeTruthy();await expect(this.heading).toBeVisible();await expect(this.row()).toBeVisible();}
 rows(){return this.page.locator('tbody tr')} row(i=0){return this.rows().nth(i)} rowByName(n:string){return this.rows().filter({hasText:n})}
 async firstName(){return(await this.row().locator('td').first().innerText()).trim()}
 async openNewMethod(){await this.page.getByRole('button',{name:/new method/i}).click();await expect(this.page.getByRole('heading',{name:'New shipping method',exact:true})).toBeVisible();}
 async openEdit(n:string){const r=this.rowByName(n);await expect(r).toHaveCount(1);await r.getByRole('button',{name:/edit/i}).click();await expect(this.page.getByRole('heading',{name:'Edit method',exact:true})).toBeVisible();}
 async openDelete(n:string){const r=this.rowByName(n);await expect(r).toHaveCount(1);await r.getByRole('button',{name:/delete/i}).click();await expect(this.page.getByRole('heading',{name:'Delete method?',exact:true})).toBeVisible();}
}
