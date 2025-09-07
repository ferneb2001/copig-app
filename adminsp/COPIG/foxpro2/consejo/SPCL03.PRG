procedure spcl03
*listado de cant.de certif. por departamento       
@04,01 clear to 23,78
@04,28 say 'CONTEO DE CERTIFICADOS  POR DEPARTAMENTO'
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
use spestad 
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(35)
whabi=' '
wcatego='  '
wtitulo=space(3)
wdpto=0
wnuind=0
select 5
use spdpto order dpto
do arma
@23,01 clear to 23,78
wkey=space(7)
select 2
*use spcerxx order cefecha
 use spcer99 order cefecha
go top
*index on ceobdpto to spcifmc
*select 2
*use spcerxx index spcifmc
*go top
set clock on
wlisto=0
wgrabo=0
do while .not. eof()
   @15, 20 say cefecha
   @15, 30 say cecerti
   if cefecha >= wfede
      if cefecha <= wfeha
               do armasu
      endif
   endif
   select 2
   skip         
enddo   
*@12,01 clear to 12,78       
@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
select 3
sort to spestads on numind 
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
   use spestads
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
   wcarne=0
   wfallec=0
   do while .not. eof()
      if wlin > 66
            do titulos
      endif
      if habili<>0   
         ?nomtit 
         ??habili pict '99999' at 50
         whabili= whabili+habili
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
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'CANTIDAD DE CERTIFICADOS POR DEPARTAMENTO ' AT 5
?? 'Fecha: ' at 48
?? wfecha 
?? 'HOJA NRO. ' at 64 
??whoja pict '999'
?
? 'Periodo desde: ' at 10
?? wfede
?? ' hasta: '
?? wfeha
?
? '      DEPARTAMENTO                            CANT.CERTIFICADOS     '
?? '         ' AT 70
wlin = 6
return

procedure arma
do while .not. eof()
   if dpto < 19
      wnuind=dpto   
      wnomtit=nombre
      wtitulo=str(dpto,3)
      select 3
      append blank
      replace numind  with wnuind
      replace codtit with wtitulo
      replace nomtit with wnomtit
      replace inscri with 0
      replace habili with 0
      replace carnde  with 0
      replace fallec with 0
   endif 
   select 5
   skip
enddo
select 3
use spestad
append blank
replace numind with 019
replace nomtit with 'Otro depto. '
replace codtit with ' 19'
replace inscri with 0
replace habili with 0
replace carnde with 0
replace fallec with 0
index on numind to spestai
return

procedure armasu
wdpto=ceobdpto
*if ceobdpto = 0 or ceobdpto = space(2)
*   wdpto=19
*endif
whabili=0
wcarne=0
wfallec=0
winscri=1
whabili=1
wlisto=wlisto+1
select 3
use spestad index spestai
seek(wdpto)
if found()
   replace habili with habili+whabili
   wgrabo=wgrabo+1
else
   wdpto=19
   seek(wdpto)
   if found()
      replace habili with habili+whabili
      wgrabo=wgrabo+1
   endif      
endif
@10,10 say wlisto
@11,10 say wgrabo
return            