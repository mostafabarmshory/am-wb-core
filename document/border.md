# Border: Definition and Usage

In the current model of contents, We save all settings of border in a *json* object named: **style.border**.  

Here, There is an example which shows how the border is stored in style:

    {
        "type": "Group",
        "style": {
            "border": {
                "width" : "10px",
                "style": "solid",
                "color": "red",
                "radius": "10px"
            }
        }
    }

As we see, The border object has 4 key/value items as below:
 
1. width
2. style
3. color
4. radius  

## 1. width

The border-width property sets the width of an element's four borders. This property can have from one to four values.

###Examples###

- border-width: thin medium thick 10px;  

       top border is thin  

       right border is medium  

       bottom border is thick  

       left border is 10px  



- border-width: thin medium thick;  

       top border is thin  
  
       right and left borders are medium  

       bottom border is thick  

- border-width: thin medium;  

       top and bottom borders are thin  

       right and left borders are medium  


- border-width: thin;  

       all four borders are thin   
 

###Notes###
  
- *border-style* property should be declared before the border-width property. An element must have borders before you can set the width.
- Default value of width is *medium(about 2px)*.  


###width: possible values###  

- medium|length|thin|thick|initial|inherit

To get more information see the link: https://www.w3schools.com/cssref/pr_border-width.asp
 
Also, To get more information about the possible values for *length* see the link: 
https://www.w3schools.com/cssref/css_units.asp  



## 2. style

The border-style property sets the style of an element's four borders. This property can have from one to four values.

###Examples###

- border-style: dotted solid double dashed;  

    top border is dotted  

    right border is solid  

    bottom border is double  
    
    left border is dashed  


- border-style: dotted solid double;  

    top border is dotted  

    right and left borders are solid  

    bottom border is double  


- border-style: dotted solid;  

    top and bottom borders are dotted  

    right and left borders are solid    

- border-style: dotted;  

    all four borders are dotted

###Note###  

- Default value of style is *none*.  

###style: possible values###  

- none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|initial|inherit;

To get more information see the link: https://www.w3schools.com/cssref/pr_border-style.asp  


## 3. color

The border-color property sets the color of an element's four borders. This property can have from one to four values.

- If the border-color property has four values:

    border-color: red green blue pink;  

    top border is red  

    right border is green  

    bottom border is blue  

    left border is pink  

- If the border-color property has three values:

    border-color: red green blue;  

    top border is red  

    right and left borders are green  

    bottom border is blue  

- If the border-color property has two values:

    border-color: red green;  

    top and bottom borders are red  

    right and left borders are green  

- If the border-color property has one value:

    border-color: red;  

    all four borders are red  

###Notes###  

- Always declare the border-style property before the border-color property. An element must have borders before you can change the color.    

- Default value of color is the current color of the element.

###color: possible values###  

- color|transparent|initial|inherit;  

To get more information see the link: https://www.w3schools.com/cssref/pr_border-color.asp 

## 4. radius  

The border-radius property defines the radius of the element's corners and allows to add rounded corners to elements! 

This property can have from one to four values. Here are the rules:

- Four values - border-radius: 15px 50px 30px 5px; (Clockwise start from top-left corner)   

    first value applies to top-left corner  

    second value applies to top-right corner

    third value applies to bottom-right corner

    fourth value applies to bottom-left corner

- Three values - border-radius: 15px 50px 30px;

    first value applies to top-left corner

    second value applies to top-right and bottom-left corners

    third value applies to bottom-right corner

- Two values - border-radius: 15px 50px; 

    first value applies to top-left and bottom-right corners
    
    and the second value applies to top-right and bottom-left corners

- One value - border-radius: 15px; 

    the value applies to all four corners, which are rounded equally.

###Notes###

- The four values for each radius are given in the order top-left, top-right, bottom-right, bottom-left.  

- If bottom-left is omitted it is the same as top-right. 

- If bottom-right is omitted it is the same as top-left. 

- If top-right is omitted it is the same as top-left.

- Default value of radius is 0.

###radius: possible values### 

- 1-4 length|% / 1-4 length|%|initial|inherit;

To get more information see the link: https://www.w3schools.com/cssref/css3_pr_border-radius.asp