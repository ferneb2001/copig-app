procedure spcuem 
*listado de empresas (cantidades)
@04,01 clear to 23,78
@04,28 say 'CONTEO DE EMPRESAS '
set talk off
set exclusive on
set safety off
set exclusive off
whabi=' '
wop=1
wnomtit=space(35)
whabi=' '
wcatego='  '
wtitulo=space(3)
wnuind=0
set date to dmy
wfecha=date()
inscri=0
tabili=0
carnde=0
whoja=0
wlin=0
@23,01 clear to 23,78
select 1
use spmatrie
go top
set clock on
@14,21 to 16,58
@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
do while .not. eof()
   @17,25 say numero
   do armasu
   select 1
   skip
enddo
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
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
   DO TITULOS
   wlin=90
   whoja=0
   winscri=0
   whabili=0
   wcarne=0
   wfallec=0
      ?inscri pict '99999' at 40 
      ??tabili pict '99999' at 50
      ??carnde  pict '99999' at 60
      winscri= winscri+inscri
      whabili= whabili+tabili
      wcarne = wcarne+carnde
      wlin=wlin+1
   ?
   ? winscri pict '99999' at 40
   ?? whabili pict '99999' at 50
   ?? wcarne pict  '99999' at 60
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
?'CANTIDAD DE EMPRESAS  ' AT 35
?? 'Fecha: ' at 95
?? wfecha 
?? ' HOJA NRO. ' at 110
??whoja pict '999'
?
? '                                     INSCRIPTAS HABILITADAS NO ACTIVAS'
wlin = 5
return

procedure arma
inscri=0
tabili=0
carnde=0
return

procedure armasu
whabili=0
wcarne=0
wfallec=0
winscri=1
@18,1 SAY 'Habilit   condic.  '
@19,1 say habili
@19,14 say condic
@19,77 get wop
read
if habili > 1994 .and. condic < '2'
   whabili=1
endif
if condic > '1'
   wcarne=1
endif
inscri = inscri+winscri
tabili = tabili+whabili
carnde = carnde+wcarne
return            