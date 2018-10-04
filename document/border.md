# Border: Definition and Usage
--- 

In the current model of contents, We save all css settings of border in a *json* object named: **style.border**.  
This object has 4 items:  
> 1. width
> 2. style
> 3. color
> 4. radius  

<br>
In the following section, These 4 items are grouped into two categories:

1. **border**, contains *(width , style , color)*
2. **border-radius**, contains *(radius)*
  

##1. border  
In CSS The *border* property is a shorthand property for:

- border-width
- border-style (required)
- border-color

> ### Our agreement  

> Although, there are various form of initialization of these three properties 
  but to maintain simplicity and generalizability, We will continue to develop under
  an agreement: border just has the form like below:  
>>>  **border: "width *(px)*  style *(predefined values in css)*  color *(choose from color pallet)*"**

> As an example,   
>>>> border: "2px solid blue"   

> will show a border around the element with the *width* of 2px,
*style* of solid and *color* of blue.

<br>
> ### UI design considerations

> - It is possible that the user does not define any border.
- **If** *border* is defined, **Then**, *border-style* is *required*. It means that the border *couldn't be 'undefined'.* 
> - border-width could be just in *px*.
> - border-width could be *'undefined'*. In this case, the default value is *'medium'* size in css (about 2px).
> - If border-color is *'undefined'*, the color applied will be the color of the text.  
<br><br>  

##2. border-radius  
The *border-radius* property defines the radius of the element's corners. This property can have from one to four values.  
<br>
> ### Our agreement  

> Although, there are various form of initialization the *border-radius* property,
  but to maintain simplicity and generalizability, We will continue to develop under
  the following agreement:  

> - It is possible that the user define no border-radius.  
> - If the user wants to choose radius, there are just two ways:  
>> 1) All border-radius are equal.  
>> 2) Select different value for each corner. Values are selected as clockwise **Clockwise**   
> (top-left, top-right- bottom-left, bottom-right).
> - The value of each item could be in *'px'* or *'%'*.
  

<br>
>### Useful links###
>> - https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
>> - https://www.w3schools.com/cssref/css3_pr_border-radius.asp