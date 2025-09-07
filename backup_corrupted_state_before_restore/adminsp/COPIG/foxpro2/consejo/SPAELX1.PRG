procedure spaelx1 
* Listado de Certificados ordenados por Profesional
*  total por profesional - cantidad de profesionales.
@04,01 clear to 23,78
@04,24 say "LISTADO DE CERTIFICADOS EMITIDOS"

wsigue='S'
close all
set printer to
set device to screen
set console on
SET TALK OFF
set exclusive off
set deleted on
close all
FILA=1
wprofe=0
contador=0
wnumero=0
set date french
wcatego=space(2)
wnom=space(30)
wtit=0
woficii=0
woficif=99
wmatri=0
wcateg=space(2)
wfeini={  /  /  }
wfefin={  /  /  }
wfecha={  /  /  }
wkey=space(9)
wkey1=space(7)
wkey2=space(7)
select 1
use spcerxx index spcerxof
@06,15 SAY "Oficina desde :"
@08,15 say "Oficina hasta :"
@10,15 say "Fecha inicial :"
@12,15 say "Fecha final   :"
@14,15 say "Matricula     :"
@14,37 say "Categor¡a:"
@06,60 say '01=Mitre 617  '
@07,60 say '02=San Rafael '
@08,60 say '03=Gral.Alvear'
@06,31 get woficii pict '99' 
@08,31 get woficif pict '99'
@10,31 get wfeini
@12,31 get wfefin
@17,15 say 'certificados'
@18,15 say 'profesionales'
read
if lastkey() <> 27
   select 1
   use spcerxx index spcerxof
   go top
   do while .not. eof()
      wkey2=str(cematri,5)+cecateg
      if woficii <= ceofici .and. ceofici <= woficif
         if wfeini <= cefecha .and. cefecha <= wfefin
            if wkey1<> wkey2
               wkey1=wkey2
               wprofe=wprofe+1
            endif   
            @14,31 say cematri 
            @14,48 say cecateg
            @15,31 say cenombre
            contador = contador + 1
            @17,40 say contador
            @18,40 say wprofe
         endif
      endif   
      skip   
   enddo
   set printer to lpt1
   store printstatus() to lista
   @23,01 say "Digite enter para continuar luego del aviso "
   if .not. lista
      wait "Encienda la impresora "
*   else
*      wait "impresora lista  "
   endif
   set console off
   set printer on
   set device to printer
   set printer to lpt1
*   ??? chr(27)+chr(15)
   do cabeza
   ?
   ? "Son: " at 10
   ?? contador at 14
   ?? " certificados " 
   ?
   ?
   ? "de "  at 10
   ?? wprofe pict '999999' at 14
   ?? ' profesionales y empresas'
   eject
*   ??? chr(27)+chr(18)
   set device to screen
   set printer to
   set console on
   wsigue = "N"
endif   
set printer to
set device to screen
set console on
close all
@04,01 clear to 23,78
*return

procedure cabeza
? "Consejo Profesional de Ingenieros y Ge¢logos de Mendoza." at 1
?
? "CANTIDADES DE PROFESIONALES CON CERTIFICADOS" at 31
? "--------------------------------------------" at 31
? 'Desde el: ' at 70
?? wfeini
?? ' al: '
?? wfefin
? " --------------------------------------------------"
?? "--------------------------------------------------------------"
FILA= 6
return

