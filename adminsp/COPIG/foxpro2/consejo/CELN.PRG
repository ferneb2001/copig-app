procedure celn 
* Listado de Certificados ordenados por Profesional
wsigue='S'
SET TALK OFF
clear
set deleted on
close all
FILA=1
wnumero=0
set date french
wcatego=space(2)
wnom=space(30)
wtit=0
woficii=0
woficif=99
wfeini={  /  /  }
wfefin={  /  /  }
wfecha={  /  /  }
wkey=space(9)
wkey1=space(7)
select 1
use spcerti index spcertof
reindex 
@04,15 say "LISTADO DE CERTIFICADOS EMITIDOS"
*@23,01 say "Coloque en la impresora caracter¡sticas de <condensado>"
@06,15 SAY "Oficina desde :"
@08,15 say "Oficina hasta :"
@10,15 say "Fecha inicial :"
@12,15 say "Fecha final   :"
@06,31 get woficii pict '99'
@08,31 get woficif pict '99'
@10,31 get wfeini
@12,31 get wfefin
read
if lastkey() <> 27
   set console off
   set printer to lpt1
   set printer on
   set device to printer
   ? chr(27)+chr(15)
   do cabeza
   do while wsigue='S'
      select 1
      use spcerti index spcertof
      go top
      do while .not. eof()
         if fila = 61
            eject
            do cabeza
            fila = 7
            loop
         endif
         if woficii <= ceofici .and. ceofici <= woficif
            if wfeini <= cefecha .and. cefecha <= wfefin
               wfecha=cefecha 
               ? cenombre at 1
               ?? cecomit at 32
               ?? wfecha at 64
               ?? cecerti at 73
               ?? celabor at 81
               fila = fila + 1
            endif
         endif   
         skip   
      enddo
      ? chr(27)+chr(18)
      eject
      ? chr(27)+chr(18)
      set device to screen
      set printer to
      wsigue = "N"
   enddo
endif
close all
@04,01 clear to 23,78
*return

procedure cabeza
? "Consejo Profesional de Ings., Agrim. y Geol. Mza." at 1
?
? "LISTADO DE CERTIFICADOS EMITIDOS " at 26
? "---------------------------------" at 26
?
? "Apellido y Nombre " at 2
?? "Comitente" at 33
?? "Fecha       Cert.   Labor Prof." at 64
? "--------------------------------------------------"
?? "--------------------------------------------------"
return

