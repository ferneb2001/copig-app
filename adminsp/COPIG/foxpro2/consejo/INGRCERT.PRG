procedure ingrcert
*  Ingreso de certificados emitidos
set talk off
set exclusive off
set multilocks on
clear
set date french
wsigue = 's'
wcontinua = 's'
wcatego=space(2)
wnom=space(30)
wfecha={  /  /  }
wcomit=space(30)
wcerti=0
wlabor=space(15)
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
select 5
use spcerti
@04,01 clear to 23,78
@04,25 say 'INGRESO DE CERTIFICADOS EMITIDOS'
wtermina='s'
do while wtermina = 's'
   wofici=0
   @05,15 say 'Oficina    :'
   @05,32 say '01=Mitre 617 02=San Rafael 03=Gral.Alvear'
   @23,01 say 'Ingrese c¢digo de Oficina ¢ <ESC> para terminar'
   @05,28 get wofici pict '99'
   read
   @23,01 clear to 23,78
   if lastkey() <> 27
      wsigue='s'
      do while wsigue = 's'
         wcatego=space(2)
         wnom=space(30)
         wcomit=space(30)
         wcerti=0
         wlabor=space(15)
         wmatri=0
         wcontinua = 's'
         do pant01
         @23,04 say 'Indique la fecha o <esc> para salir'
         @06,28 get wfecha
         read
         @23,01 clear to 23,78
         if lastkey() <> 27
            werror=0
            do while wcontinua = 's'
               wcatego=space(2)
               wnom=space(30)
               wcomit=space(30)
               wcerti=0
               wlabor=space(15)
               wmatri=0
               werror=0
               @08,50 clear to 09,78
               @16,01 clear to 16,78
               @23,04 say 'Indique Matr¡cula o <ESC> para volver'
               @08,28 get wmatri pict '99999'
               read
               @23,01 clear to 23,78
               if lastkey() <> 27
                  @23,04 say 'Indique Categor¡a'
                  @08,46 get wcatego pict '!!'
                  read
                  wkey=str(wmatri,5)+wcatego
                  if wcatego = 'EM'
                     select 4
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 3
                        seek(wkey1)
                        if found()
                           @09,31 say nombre
                           wnom=nombre
                           @16,15 say 'Habilitada a¤o '
                           @16,31 say d.habili
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
                           @09,31 say nombre
                           wnom=nombre
                           @16,15 say 'Habilitado a¤o: '
                           @16,31 say b.habili
				           do buscatit
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
                     do ingrecer
                  endif
               else
                  wcontinua = 'n'      
               endif
            enddo   
         else
            wsigue = 'n'   
         endif
      enddo
   else
      wtermina='n'
   endif   
enddo         
close all
@06,01 clear to 23,78
return

procedure ingrecer
@ 23,01 say 'Ingrese labor profesional o <esc> para otro profesional'
@10,28 get wlabor pict '@!'
@23,01 clear to 23,78
@12,28 get wcomit pict '@!'
@14,28 get wcerti
read
if lastkey() <> 27
   select 5
   use spcerti
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
endif   
return

procedure pant01
@06,15 say 'Fecha      :'
@08,15 say 'Matricula  :'
@08,35 say 'Categoria:'
@12,15 say 'Comitente  :'
@14,15 say 'Certificado:'
@10,15 say 'Labor Prof.:'
return

procedure buscatit
wtitdesc=space(30)
select 6
use sptitu order titulo
select 2
set relation to titulo into sptitu
wtitdesc= f.titdesc
@08,51 say f.titdesc
return