procedure spaele2 
* Listado de Certificados ordenados por Profesional
@04,01 clear to 23,78
@04,24 say "LISTADO DE CERTIFICADOS EMITIDOS  1994/1995"

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
select 1
use spcer95 order cenombre
*reindex 
*@23,01 say "Coloque en la impresora caracter¡sticas de <condensado>"
@06,15 SAY "Oficina desde :"
@08,15 say "Oficina hasta :"
@10,15 say "Fecha inicial :"
@12,15 say "Fecha final   :"
@14,15 say "Matricula     :"
@14,37 say "Categor¡a:"
@06,60 say '01=Mitre 617  '
@07,60 say '02=San Rafael '
@08,60 say '03=Gral.Alvear'
@09,60 say '04=San Mart¡n '
@06,31 get woficii pict '99' 
@08,31 get woficif pict '99'
@10,31 get wfeini
@12,31 get wfefin
@14,31 get wmatri pict '99999'
@14,48 get wcateg pict '!!'
read
if wmatri<>0
   wkey1=str(wmatri,5)+wcateg
endif   
if lastkey() <> 27
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
   ??? chr(27)+chr(15)
   do cabeza
   do while wsigue='S'
      select 1
      use spcer95 order cenombre
      go top
      do while .not. eof()
         if fila >= 66
            eject
            do cabeza
*            fila = 7
            loop
         endif
*         @15,10 say cenombre
*         @15,50 say cecerti
         if woficii <= ceofici .and. ceofici <= woficif
            if wfeini <= cefecha .and. cefecha <= wfefin
               if wkey1<>space(7)
                  if str(cematri,5)+cecateg=wkey1
                     wfecha=cefecha 
                     ? cenombre at 1
                     ?? cecomit at 32
                     ?? wfecha at 64
                     ?? cecerti at 76
                     ?? ceofici at 86 
                     ?? celabor at 90
                     fila = fila + 1
                     if celab1<>space(69)
                     	? celab1 at 55
                     	fila =fila+1
                     endif
                     	if celab2<>space(69)
                     		? celab2 at 55
                     		fila =fila+1
                     	endif
                     		if celab3<>space(69)
                     			? celab3 at 55
                     			fila=fila+1
                     	endif
                     ? 'Obra: ' at 39
                     ?? ceobra at 55
                     ? 'Domicilio: ' at 39
                     ?? cedomob at 55
                     ? 'Sup. Cubierta: ' at 39
                     ?? cesupf at 55
                     fila=fila+3
                     contador = contador + 1
                  endif
               else   
                  wfecha=cefecha 
                  ? cenombre at 1
                  ?? cecomit at 32
                  ?? wfecha at 64
                  ?? cecerti at 76
                  ?? ceofici at 86
                  ?? celabor at 90
                  fila = fila + 1
                     if celab1<>space(69)
                     	? celab1 at 55
                     	fila =fila+1
                     endif
                     	if celab2<>space(69)
                     		? celab2 at 55
                     		fila =fila+1
                     	endif
                     		if celab3<>space(69)
                     			? celab3 at 55
                     			fila=fila+1
                     	endif
                     ? 'Obra: ' at 39
                     ?? ceobra at 55
                     ? 'Domicilio: ' at 39
                     ?? cedomob at 55
                     ? 'Sup. Cubierta: ' at 39
                     ?? cesupf at 55
                     fila=fila+3
                  contador = contador + 1
               endif
            endif
         endif   
         skip   
      enddo
      ?
      ? "Son: " at 10
      ?? contador at 14
      ?? " certificados " 
      eject
      ??? chr(27)+chr(18)
      set device to screen
      set printer to
      set console on
      wsigue = "N"
   enddo
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
? "LISTADO DE CERTIFICADOS EMITIDOS " at 31
?? 'Desde el: ' at 70
?? wfeini
?? ' al: '
?? wfefin
? "---------------------------------" at 31
? "Apellido y Nombre " at 2
?? "Comitente" at 33
?? " Fecha   Certificado Of.  Labor Profesional" at 64
? " --------------------------------------------------"
?? "--------------------------------------------------------------"
FILA= 6
return

