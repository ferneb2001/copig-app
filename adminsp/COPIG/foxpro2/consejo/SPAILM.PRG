procedure spailm
*  Ingreso y listado de profesionales con titulo y observ. Municipalidades
set talk off
@04,01 clear to 23,78
wsigue = 's'
wcontinua = 's'
wsena=0
wcatego=space(2)
wnom=space(30)
wfecha={  /  /  }
wmatri=0
wkey=space(7)
wkey1=space(9)
wop=0
select 1
use spprof index spprof
select 2
use spmatri index spmatri
select 3
use spprofe index spprofe
select 4
use spmatrie index spmatrie
wfecha=date()
wtermina='s'
*do while wtermina = 's'
   @04,01 clear to 23,78
   @04,10 say 'INGRESO DE PROFESIONALES SIN CERTIFICADOS EN MUNICIPALIDADES'
         wcatego=space(2)
         wnom=space(30)
         wtitdesc=space(30)
         wmatri=0
         wcontinua = 's'
         @23,01 clear to 23,78
            do while wcontinua = 's'
               wcatego=space(2)
               wnom=space(30)
               wmatri=0
               whabili=0
               wobserv=space(50)
               wtitdesc=space(30)
               WDESCSAN=space(12)
               wdesccur=space(30)
               werror=0
               @07,01 clear to 18,78
               @19,01 clear to 23,78
               @07,15 say 'Matricula  :'
               @07,35 say 'Categoria:'
               @23,04 say 'Indique Matr¡cula o <ESC> para volver'
               @07,28 get wmatri pict '99999'
               read
               @23,01 clear to 23,78
               if lastkey() <> 27
                  @23,04 say 'Indique Categor¡a'
                  @07,46 get wcatego pict '!!'
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
                           @08,24 say nombre
                           wnom=nombre
                           werror=0
                           @19,15 say 'Habilitada a¤o '
                           @19,31 say d.habili
                           whabili=d.habili
                           do buscrep
                           @23,01 clear to 23,78
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
                           @08,24 say nombre
                           wnom=nombre
                           whabili=0
                           wobserv=space(50)
                           werror=0
                           @19,15 say 'Habilitado a¤o: '
                           @19,31 say b.habili
                           whabili=b.habili
				           do buscatit
				           do buscacur
				           do buscadom
				           do buscsanc
                           @23,01 clear to 23,78
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
                        wimp=1
                        @23,01 clear to 23,78
                        @23,30 get wimp pict '@*H \<Salir;\<Imprimir' size 1,1
                        read
                        @23,01 clear to 23,78
                        if wimp=2
                           do imprime
                        endif
                  endif
               else
                  wcontinua = 'n'      
               endif
            enddo   
*         else
*            wsigue = 'n'   
*         endif
*      enddo
*   else
*      wtermina='n'
*   endif   
*enddo         
close all
@04,01 clear to 23,78
return

procedure buscatit 
wtitdesc=space(30)
select 6
use sptitu order titulo
select 2
set relation to titulo into sptitu
wtitdesc= f.titdesc
@07,49 say f.titdesc
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
      @20,15 say 'Curso efectuado: '
      @20,31 say descrip
      wdesccur=descrip
   else
      @20,31 say 'curso sin descripcion '
   endif
else
   @20,31 say  '                             '
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
@21,15 say "Domicilio:"
@21,31 say a.domici
@22,30 say wlocali
@22,47 say wdpto
@22,64 say wpcia
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
wlin=20
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
      wlin=20
      @23,01 clear to 23,78
   endif
   select 7               
   continue
enddo
return


procedure buscsanc
wop99=' '
wdescsan=space(12)
select 6
use spsanc index spsanc
locate for wkey=str(matric,5)+catego
if found()
      @19,50 say 'Existe sanc.     ' color n/w*
      @19,78 get wop99
      wdescsan='Existe Sanc.'
      read
else
      @19,50 say '                  '
endif
select 6
use sprestri index sprestri
locate for  wkey=str(matric,5)+catego
if found()
      @18,35 say 'Existe Restriccion ' color n/w*
      @18,77 get wop99
      read
else
      @18,35 say '                  '
endif
return            

procedure imprime
set console off
set printer on
set device to printer
set printer to 'LPT1'
??? chr(27)+chr(48)
??? chr(27)+chr(15)
if wsena = 0
   ? '   CONSEJO PROFESIONAL DE ING., AGRIM. Y GEOL. MZA.'
   ? '             Listado de Profesionales con situacion irregular en Municipalidades'
   ? ' al: ' at 80
   ?? wfecha
endif   
	? wnom
	?? wmatri pict '99999' at 31
	?? wcatego pict '#!' at 37
	?? wtitdesc at 40
	?? whabili pict '9999' at 70
	?? wdescsan at 74
	?? wdesccur at 86
	wsena=1
set printer off
set device to screen
return    
    