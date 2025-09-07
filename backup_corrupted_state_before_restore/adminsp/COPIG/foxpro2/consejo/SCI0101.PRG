procedure sci0101
* programa de Caja Ingresos
set talk off
@04,01 clear to 23,78
do titpan01
*@04,25 say 'MOVIMIENTOS DE CAJA INGRESOS '
*@05,25 say ' Concepto: '
set date to dmy
wconcepto=0
wcopias=0
wop=space(1)
wcompr=0
wcptoc=0
wcateg=space(2)
wmatric=0
wimporte=0
wimporte2=0
wfecha=date()
select 1
use scconcep order codconc
@03,55 say wfecha
@03,55 get wfecha
read
if lastkey()<>27
   do while wconcepto <> 99
      @23,01 SAY 'Ingrese concepto o 99 para salir '
      @05,36 get wconcepto pict '99'
      read
      if lastkey()<>27
         if wconcepto <> 99
            select 1
            seek(wconcepto)
            if found()
               @05,40 say nomconc
            else
               @05,40 say 'No existe concepto en archivo'   
            endif
            wmatri=0
            wcate='  '
*            do titpan01
            @08,02 get wcompr pict '9999999'
            read
            if lastkey() <> 27
               if wconcepto = 01 or wconcepto = 02
************                         matriculas profesionales
                  wabando=0
                  wkey=space(7)
                  wkey1=space(9)
                  select 2
                  use spmatri index spmatri
                  @08,14 get wmatri pict '99999'
                  read
                  if lastkey()<>27
                     @08,20 get wcate PICT '!!'
                     read
                     wkey=str(wmatri,5)+wcate
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 3
                        use spprof index spprof
                        seek(wkey1)
                        if found()
                           @08,25 SAY NOMBRE
                    *      datos del profesional
                        else
                           @23,01 say 'No existe Profesional'
                           @23,77 get wop pict '9'
                           read
                           wabando=1
                        endif
                     else
                        @23,01 say 'No existe Profesional '
                        @23,78 get wop pict '9'
                        read
                        wabando=1
                     endif
                  endif  
               else
                  if wconcepto = 03 or wconcepto = 04
*                         matriculas empresas
                  wabando=0
                  wkey=space(7)
                  wkey1=space(9)
                  select 4
                  use spmatrie index spmatrie
                  @08,14 get wmatri pict '99999'
                  read
                  if lastkey()<>27
                     @08,20 get wcate PICT '!!'
                     read
                     wkey=str(wmatri,5)+wcate
                     seek(wkey)
                     if found()
                        wkey1=str(dctipo,1)+str(dcnro,8)
                        select 5
                        use spprofe index spprofe
                        seek(wkey1)
                        if found()
                           @08,25 SAY NOMBRE
                    *      datos del profesional
                        else
                           @23,01 say 'No existe Empresa    '
                           @23,77 get wop pict '9'
                           read
                           wabando=1
                        endif
                     else
                        @23,01 say 'No existe Empresa     '
                        @23,78 get wop pict '9'
                        read
                        wabando=1
                     endif
                  endif  
                  else
*                         tratamiento de otros conceptos
                  endif
               endif
            else
               wconcepto=99
            endif
         else
            wconcepto=99
         endif
      else
         wconcepto = 99   
      endif        
   enddo
endif
return 

procedure titpan01
@06,01 clear to 23,78
@03,26 say 'MOVIMIENTOS DE CAJA '
@05,26 SAY 'Concepto: '
@07,1 say 'Comprobante  Matr¡cula        Nombre'
@07,65 say 'Importe '
return