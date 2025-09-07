procedure spcona
*  Listado de Profesionales/Empresas digitados con fecha hab.
set talk off
set date to french
@04,01 clear to 23,78
@04,24 say 'LISTADO DE PROFESIONALES/EMPRESAS'
@06,15 say 'Fecha      :'
@08,15 say 'Matricula  :'
@08,35 say 'Categoria:'
wsigue = 's'
wcontinua = 's'
wcatego=space(2)
wnom=space(30)
wfecha={  /  /  }
wmatri=0
wkey=space(7)
wkey1=space(9)
wop=0
wsanc=' '
wrest=' '
wtitdesc=space(30)
wdesccur=space(30)
select 1
use spprof index spprof
select 2
use spmatri index spmatri
select 3
use spprofe index spprofe
select 4
use spmatrie index spmatrie
wtermina='s'
      wsigue='s'
      do while wsigue = 's'
         wcatego=space(2)
         wnom=space(30)
         wmatri=0
         wcontinua = 's'
         @23,04 say 'Indique la fecha o <esc> para salir'
         @06,28 get wfecha
         read
         @23,01 clear to 23,78
         if lastkey() <> 27
            werror=0
            do while wcontinua = 's'
               wcatego=space(2)
               wnom=space(30)
               wmatri=0
               werror=0
               @08,49 clear to 09,78
               @16,01 clear to 22,78
               @23,04 say 'Indique Matr¡cula o <ESC> para volver'
               @08,28 get wmatri pict '99999'
               read
               @23,01 clear to 23,78
               if lastkey() <> 27
                  @23,04 say 'Indique Categor¡a'
                  @08,46 get wcatego pict '!!'
                  read
                  @23,01 clear to 23,78
                  wkey=str(wmatri,5)+wcatego
                  if wcatego = 'EM'
                     select 4
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 3
                        seek(wkey1)
                        if found()
                           @09,24 say nombre
                           wnom=nombre
                           werror=0
                           @16,15 say 'Habilitada a¤o '
                           @16,31 say d.habili
                           whabil=d.habili
                *           do buscrep
                        else
                           @22,01 say 'No existe Empresa'
                           @22,78 get wop
                           read
                           werror = 1
                           @22,01 clear to 22,78
                        endif   
                     else
                        @22,01 say 'No existe Empresa'
                        @22,78 get wop
                        read
                        werror = 1
                        @22,01 clear to 22,78
                     endif   
                  else
                     select 2
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 1
                        seek(wkey1)
                        if found()
                           @09,24 say nombre
                           wnom=nombre
                           werror=0
                           @16,15 say 'Habilitado a¤o: '
                           @16,31 say b.habili
                           whabil=b.habili
				           do buscatit
				           do buscacur
				   *        do buscadom
				           do buscsanc
                        else
                           @22,01 say 'No existe Profesional'
                           @22,78 get wop
                           read
                           werror = 1
                           @22,01 clear to 22,78
                        endif
                     else
                        @22,01 say 'No existe Profesional'
                        @22,78 get wop
                        read
                        werror = 1
                        @22,01 clear to 22,78
                     endif
                  endif
                  if werror = 0
                     wop=1
                     @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
                     read
                     @23,01 clear to 23,78
                     if wop=2
                        do imprime
                     endif   
                  endif
               else
                  wcontinua = 'n'      
               endif
            enddo   
         else
            wsigue = 'n'   
         endif
      enddo
*   else
*      wtermina='n'
*   endif   
*enddo         
close all
@04,01 clear to 23,78
return

procedure ingrecer
   select 5
   use spcerti index spcertof, spcertmc, spcertcm
   append blank
   replace ceofici  with wofici
   replace cematri  with wmatri
   replace cecateg  with wcatego
   replace cenombre with wnom
   replace cefecha  with wfecha
   replace cecerti  with wcerti
   replace cecomit  with wcomit
   replace celabor  with wlabor
   @16,01 clear to 16,78
return


procedure buscatit 
wtitdesc=space(30)
select 6
use sptitu order titulo
select 2
set relation to titulo into sptitu
wtitdesc= f.titdesc
@08,49 say f.titdesc
return

procedure buscacur
wdesccur=space(30)
select 6
use spcursos index spcursos
select 7
use spdescur order curso
select 6
seek(wkey)
if found()
   wkeycu=str(curso,3)
   select 7
   seek(wkeycu)
   if found()
      @17,15 say 'Curso efectuado: '
      @17,31 say descrip
      wdesccur=descrip
   else
      @17,31 say 'curso sin descripcion '
   endif
else
   @17,31 say  '                             '
endif
return            

procedure buscadom
wlocali=space(15)
wdpto=space(15)
wpcia=space(10)
select 6
use splocal order cod
seek(str(a.locali,3))
if found()
   wlocali=nombre
else
   wlocali=space(15)
endif
select 6
use spdpto order dpto
seek(str(a.dpto,3))
if found()
   wdpto=nombre
else
   wdpto=space(15)
endif
select 6
use spprov order prov
seek(a.provin)
if found()
   wpcia=nombre
else
   wpcia=space(10)
endif
@18,15 say "Domicilio:"
@18,31 say a.domici
@19,30 say wlocali
@19,47 say wdpto
@19,64 say wpcia
return                  

procedure buscrep
wrtfecha={  /  /  }
wcatrt=space(2)
wnomrt=space(30)
wmatrt=0
wkeyrt=space(7)
wkeyrt1=space(9)
wrtntit=space(23)
select 7
use sprtcos order empresa
go top
wlin=17
locate for str(empresa,5)=str(wmatri,5)
do while found()
   @wlin,01 say matprof
   @wlin,7 say categor
   wrtfecha=rtfinal
   @wlin,43 say wrtfecha
   wkeyrt=str(matprof,5)+categor
   select 2
   use spmatri index spmatri
   seek(wkeyrt)
   if found()
      @wlin,52 say habili pict '9999'
      select 6
      use sptitu order titulo
      select 2
      set relation to titulo into sptitu
      wrtntit=f.titdesc
      @wlin,56 say wrtntit
      select 2
      wkeyrt1=str(dctipo,1)+str(dcnro,8)
      select 1
      use spprof index spprof
      seek(wkeyrt1)
      if found()
         @wlin,10 say nombre
      else
         @wlin,10 say 'no existe profesional en archivo'
      endif
   else
      @wlin,10 say 'No existe matricula en archivo'
   endif
   if wlin < 23
      wlin = wlin+1
   else
      @23,01 say 'Oprima cualquier tecla para continuar'
      read
      wlin=16
      @23,01 clear to 23,78
   endif
   select 7               
   continue
enddo
return


procedure buscsanc
wop99=' '
wsanc=' '
*wdesccur=space(30)
select 6
use spsanc index spsanc
locate for wkey=str(matric,5)+catego
if found()
      @20,15 say 'Existe sanc.     ' color n/w*
      wsanc='S'
      @20,78 get wop99
      read
else
      @20,15 say '                  '
endif
wrest=' '
select 6
use sprestri index sprestri
locate for  wkey=str(matric,5)+catego
if found()
      @21,15 say 'Existe Restriccion ' color n/w*
      wrest="R"
      @21,77 get wop99
      read
else
      @21,15 say '                  '
endif
return            
   
procedure imprime
set console off
set printer on
set device to printer
set printer to LPT1
?  wnom  
?? wtitdesc  at 31
?? whabil pict "9999" at 62
?? wsanc  at 67
?? wrest  at 69
?? wdesccur  at 70
set printer off
set device to screen
*set console on
return   