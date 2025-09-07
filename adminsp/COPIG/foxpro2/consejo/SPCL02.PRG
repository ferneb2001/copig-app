procedure spcl02
*listado de cant.de certif. por profesional       
@04,01 clear to 23,78
@04,28 say 'CONTEO DE CERTIFICADOS  POR PROFESIONAL'
wfede={  /  /  }
wfeha={  /  /  }
set date to dmy
wfecha=date()
@06,10 say 'Indique Fecha Inicial: '
@07,10 say 'Indique Fecha Final  : '
@06,50 get wfede
@07,50 get wfeha
read
wtemp=0
set talk off
select 3
set exclusive on
set safety off
use spestad1 
zap
set exclusive off
wcant=0  
wop=1
wnomtit=space(30)
wcatego='  '
wnuind=0
@23,01 clear to 23,78
wkey=space(7)
WKEY1=SPACE(7)
select 1
use spmatri index spmatri
select 2
use spcerxx
go top
index on str(cematri,5)+cecateg to spcifmc
select 2
use spcerxx index spcifmc
go top
set clock on
do while .not. eof()
   @15, 20 say cefecha
   @15, 30 say cecerti
   if cefecha >= wfede
      if cefecha <= wfeha
       if cecateg<>'EM'
         wkey=str(cematri,5)+cecateg   
         if wkey<>wkey1
            if wnuind <> 0
               do armasu
            else
               wnuind=1   
            endif
            select 2
            wnomtit=cenombre
            wcatego=cecateg
            wmatri=cematri
            wkey1=wkey
            wcant=wcant+1
         else
            wcant=wcant+1      
         endif
       endif     
      endif
   endif
   select 2
   skip         
enddo   
*@12,01 clear to 12,78       
@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
select 3
*sort to spstad1s on est1nomb 
sort to spstad1s on est1cert
do imprime
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 4
   use spstad1s
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
   wlin=90
   whoja=0
   winscri=0
   whabili=0
   do while .not. eof()
      if wlin > 66
            do titulos
      endif
      if est1cert<>0   
         ?est1nomb 
         ??est1cert pict '99999' at 50
         whabili= whabili+est1cert
         wlin=wlin+1
      endif
      skip
   enddo
   ?
   ? '  T O T A L     '
   ?? whabili pict '99999' at 50
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
whoja=whoja+1
IF WHOJA<> 1
   if wlin > 66
      eject
   endif
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS, AGRIMENSORES Y GEOLOGOS - MENDOZA' 
?
?'CANTIDAD DE CERTIFICADOS POR PROFESIONAL ' AT 10
?? 'Fecha: ' at 48
?? wfecha 
?? ' HOJA NRO. ' at 64 
??whoja pict '999'
? 'Periodo desde: ' at 10
?? wfede
?? ' hasta: '
?? wfeha
?
? '      PROFESIONAL                             CANT.CERTIFICADOS     '
?? '         ' AT 70
wlin = 6
return

procedure armasu
select 1
seek(wkey1)
if found()
	wtitulo=titulo
else
	wtitulo=space(3)
endif
select 3
use spestad1
append blank
   replace est1nomb  with wnomtit
   replace est1cate  with wcatego    
   replace est1matr  with wmatri
   replace est1cert  with wcant
   replace est1tit   with wtitulo
wcant=0      
return            