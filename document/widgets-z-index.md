# ZIndex and layouts

Ensuring widgets do not conflict with the environment forces to define a layout of objects. For example, if a widget ZIndex is 100 and the editor tries to display a dialog message with ZIndex 80, then the dialog will be displayed behind the widget! To overcome this problem WB supposes a layering system based on zIndex.

WB define the following layers:

- content [0, 40)
- editor [40, 50)
- menus [50, 60)
- tool [60, 70)
- sidenav [70, 80)
- dialog [80, 90)

So to create valid content you must use ZIndex in the range of 0 to 50. For example, all widget locators will be added in the editor layer (40) to be on the top of all contents.

Note: z-index only works on positioned elements (position: absolute, position: relative, position: fixed, or position: sticky).