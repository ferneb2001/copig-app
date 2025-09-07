procedure cpro02a
* Arma archivo de padrones PADRO1.DBF
clear
set delete on
*set exclusive off
set device to screen
set talk off
do pie
set date to french
select 1
use spmasor
select 2
use spprof index spprof
select 3
use sptitu order titulo
select 4
*set exclusive off
use padro1
zap
wfedad={31/08/65}
wfemat={31/08/87}
wferesi={31/08/91}
wkey1=str(9)
wkey=str(7)
wtitu='   '
wsena=0
select 1
GO TOP
do while not eof()
   @05,01 say numero
   @05,07 say titulo
   @05,12 say condic
   if condic < '2'
      if wtitu <> titulo
         wtitu = titulo
         wpaseti=1
         select 3
         locate for titulo = wtitu
         if found()
            wtidesc=titplur
            wpacod = tipadron
         else
            wtidesc=space(35)
            wpacod ='Z'
         endif
         if wpacod < '9'
            select 4
            append blank 
            replace padcod  with wpacod
            replace padtitu with wtitu
            replace padseti with wpaseti
            replace padayn  with wtidesc
         endif   
         select 1     
      endif
      wcateg=catego
      wmatri=numero
      wtitu=titulo
      winscr=inscr
      wpaseti=5
      wkey=str(numero,5)+catego
      wkey1=str(dctipo,1)+str(dcnro,8)
      select 2
      seek(wkey1)
      if found()
         wnombre=nombre
         wnacio =nacio
         wnacion=nacion
      else
         wnombre=spaces(30)
         wnacio={  /  /  }
         wnacion='1'
      endif
      if wnacio > wfedad
         wpase2='x'
      else
         wpase2=' '
      endif
      if wnacion <> 'A'
         wpase3='o'
      else
         wpase3=' '
      endif
      if winscr > wfemat
         wpase1='+'
      else
         wpase1=' '
      endif
      if winscr > wferesi
         wpase4= '='
      else
         wpase4= ' '
      endif
      do buscasan
      if wsena = 1
         wpase5= '*'
      else
         wpase5= ' '
      endif                                  
      select 3
      locate for titulo = wtitu
      if found()
         wtidesc=titplur
         wpacod = tipadron
      else
         wtidesc=space(35)
         wpacod =tipadron
      endif
      if wpacod < '9'
         select 4
         append blank 
         replace padcod  with wpacod
         replace padtitu with wtitu
         replace padseti with wpaseti
         replace padayn  with wnombre
         replace padmatri with wmatri
         replace padse1  with wpase1
         replace padse2  with wpase2
         replace padse3  with wpase3
         replace padse4  with wpase4
         replace padse5  with wpase5
      endif   
      select 1     
      skip
   else
      skip      
   endif
enddo
close all
*end

procedure buscasan
wsena=0
select 5
use spsanc index spsanc
locate for wkey = str(matric,5)+catego
if found()
   if santipo = '1'
      if saninci = 'd' or saninci = 'D' or saninci = 'e' or saninci = 'E'
         wsena = 1
      endif
   endif      
endif
return


procedure pie
@05,01 clear to 05,78
@20,03 clear to 20,78
@01,00 to 24,78 double
@03,01 to 03,78
@02,01 say 'CONSEJO PROF. DE INGENIEROS, AGRIMENSORES Y GEOLOGOS'
@02,63 SAY 'ADMINISTRACION' COLOR SCHEME 5
return