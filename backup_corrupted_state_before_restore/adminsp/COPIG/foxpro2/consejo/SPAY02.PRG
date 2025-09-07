procedure spay02
*@04,01 clear to 11,78
define window pay02 from 04,01 to 17,78
activate window pay02
@01,02 say 'Esta pantalla contiene los datos personales del profesional seleccionado. '
@02,02 say 'Usted tiene ahora tres alternativas: <SALIR>, <MODIFICAR> y <OTROS DATOS> '
@03,02 say 'Si selecciona <SALIR>, aparecer n en la pantalla los datos del profesio-  '
@04,02 say 'nal correspondientes a su matricula. La opci¢n <MODIFICAR> le permite mo- '
@05,02 say 'dificar los datos personales del profesional, excepto su tipo y n£mero de '
@06,02 say 'documento de identidad. La opci¢n <OTROS DATOS> le permiti  acceder a da- '
@07,02 SAY 'adicionales de este profesional. La opci¢n <F1 Ayuda> es la que Ud.ha se-                                          '
@08,02 say 'leccionado para acceder a esta pantalla.                                                                          '
@09,02 say 'NOTA: La opci¢n <MODIFICAR> se encuentra bloqueada si Ud. accedi¢ a  esta '
@10,02 say 'pantalla atravez de la opci¢n CONSULTAS del MENU PRINCIPAL'
@11,02 say '- - - Para salir de esta pantalla de ayuda oprima cualquier tecla. - -- - ' 
read
deactivate window pay02
return