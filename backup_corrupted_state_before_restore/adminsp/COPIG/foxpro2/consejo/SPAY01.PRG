procedure spay01
*@04,01 clear to 23,78
define window pay01 from 04,01 to 22,78
activate window pay01
@01,02 say 'Esta opci¢n le permite actualizar los archivos de profesionales.Coloque el'
@02,02 say 'n£mero de matricula y categoria. Si el profesional existe en  los archivos'
@03,02 say 'los datos correspondientes a la matricula aparecen en la pantalla. En este'
@04,02 say 'caso, el sistema le permite seleccionar tres opciones <SALIR>,<MODIFICAR>,'
@05,02 say '<OTROS DATOS>. <SALIR> Retorna al punto en que  debe  suministrarse nro.de'
@06,02 say 'matricula y categor¡a o <ESC> para retornar al Men£ Anterior. <MODIFICAR> '
@07,02 SAY 'le permitir  modificar los datos que est n en la pantalla, excepto el n£me'
@08,02 say 'ro de matricula y la categor¡a. <OTROS DATOS> le permitir   acceder a otra'
@09,02 say 'pantalla que contiene datos adicionales de este profesional.              '
@10,02 say 'Si el profesional no existiera en los archivos, el cursor se colocar  en  '
@11,02 say 'el lugar correspondiente al NOMBRE asumiendo que Ud. quiere ingresarlo co-'
@12,02 say 'mo un nuevo profesional. Si este no fuese el caso, oprimir la tecla <ESC>.'
@13,02 say 'Si quiere ingresar un nuevo profesional consigne los datos correspondien- '
@14,02 say 'tes siguiendo las instrucciones que aparecen al pie de la pantalla.       '
@15,02 say '- - - Para salir de esta pantalla de ayuda oprima cualquier tecla. - -- - ' 
read
deactivate window pay01
return