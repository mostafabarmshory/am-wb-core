## Border: Definition and Usage
--- 

Here, we consider to two main properties of border  

1. border
2. border-radius  
  

##1. border  
In *CSS* The border property is a shorthand property for:

1. border-width
2. border-style (required)
3. border-color

### Our agreement  

- Although, there are various form of initialization of these three properties 
  but to maintain simplicity and generalizability, We will continue to develop under
  an agreement: border just has the form like below:  
>>>  **border: "width *(px)*  style *(predefined values in css)*  color *(choose from color pallet)*"**

> As an example,   
>>> border: "2px solid blue"   

> will show a border around the element with the *width* of 2px,
*style* of solid and *color* of blue.


### UI design considerations

- It is possible that the user does not define any border.
- **If** border is defined, **Then**:
> - border-style is *required*. It means that the border *couldn't be 'undefined'.* 
> - border-width could be just in *px*.
> - border-width could be *'undefined'*. In this case, the default value is *'medium'* size in css (about 2px).
> - If border-color could be *'undefined'*. In this case, the color applied will be the color of the text.  

   