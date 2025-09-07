procedure spacp
*consulta de profesionales
@04,01 clear to 23,78
@04,28 say 'CONSULTA DE PROFESIONALES'
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
wsigue='S'
@06,01 say 'MATRICULA       CATEGORIA    '
@06,30 say 'NOMBRE: '
do while wsigue='S'
   wop=1
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Matricula;\<Por Dcto';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(30)
         @06,30 say 'NOMBRE: '
         @23,01 say 'Indique el nombre del profesional'
         @06,38 get wnom pict '@!'
         read
         SELECT 1 
         use spprof index spprofn
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow all for nombre =rtrim(wnom) in pnom
         deactivate window pnom 
         wkey=str(dctipo,1)+str(dcnro,8)
         select 2 
         use spmatri index spmatdo
         locate for wkey=str(dctipo,1)+str(dcnro,8)
         do while found()
*                                      seek(wkey)
*                                      if found()
            do ver
            select 2 
            continue
         enddo   
*                                      else
*                                      @06,10 say 'Sin matr¡cula'   
*                                      endif
      else
         if wop= 3
            @06,01 say 'MATRICULA       CATEGORIA    '
            @23,01 say 'Indique el nro.de matricula y categoria o <ESC> para salir'  
            @06,11 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               @06,27 get wcatego pict '!!'
               read
               wkey2=str(wmatric,5)+wcatego
               select 2 
               use spmatri index spmatri
               seek(wkey2)
               if found()
                  wkey=str(dctipo,1)+str(dcnro,8)
                  select 1 
                  use spprof index spprof
                  seek(wkey)
                  if found()
                  else
                     @06,38 say 'Sin datos personales'
                  endif
                  select 2   
                  do ver
               else
                  @06,10 say 'Sin matr¡cula'   
               endif
            else
            endif
         else
            if wop= 4
               @07,01 say 'TIPO:    NUMERO:'
               @23,01 say 'Indique tipo y nro de documento o <ESC> para salir'
               @07,07 get wdctoti pict '9'
               read
               if lastkey()<>27
                  @07,18 get wdctonr pict '99999999'
                  read
                  wkey=str(wdctoti,1)+str(wdctonr,8)
                  select 2 
                  use spmatri index spmatdo
                  seek(wkey)
                  if found()
                     select 1
                     use spprof index spprof
                     seek(wkey)
                     if found()
                        select 2
                     else
                        @06,38 say 'Sin datos personales'
                     endif   
                     do ver
                  else
                     @06,10 say 'Sin matr¡cula'
                     read   
                  endif
               else
               endif                 
            endif
         endif   
      endif          
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure ver
*select 1
wkey2=str(numero,5)+catego
@06,11 say b.numero
@06,27 say b.catego
@06,38 say a.nombre
do panta01
*  se relaciona matri con titu para poner descrip.del titulo
select 3
use sptitu order titulo
select 2
set relation to titulo into sptitu            
wtitdesc=c.titdesc
wotorga=b.otorga
@08,17 say c.titulo
@08,21 say c.titdesc
@09,16 say b.otorga
@10,17 say b.inscr
@12,17 say b.fectit
@14,17 say b.pago
@16,17 say b.habili
@18,17 say b.feccert
if b.fectit <> {  /  /  }
   @20,17 say 'definitiva'
else
   @20,17 say 'provisoria'
endif
select 3
use spente order codigo
seek(b.otorga)
if found()
   wnoment=nombre
else
   wnoment=space(15)
endif
   @09,21 say wnoment                             
@23,01 say 'Oprima <ENTER> para ver datos personales'
read
do persona2 with wkey, wkey2
return