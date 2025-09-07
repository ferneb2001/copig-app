procedure spalctt
*listado de profesionales
*      con titulos auxiliares (otros titulos)
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use f:\consejo\cctt\spprof index f:\consejo\cctt\spprof
*use spprof index spprof
select 3
use f:\consejo\cctt\fprof1 index f:\consejo\cctt\fprof1x
set safety off
wfecha={  /  /  }
@06,10 SAY 'Fecha del listado: '
@06,32 get wfecha
set exclusive off
whabi=' '
wop=1
wnomtit=space(30)
   wcatego='  '
   wdpto=0
   wnomdpto=space(15)
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      select 2
      go top
      set clock on
      @14,21 to 16,62
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
	      wkey=str(dctipo,1)+str(dcnro,8)
	      @10,10 say dcnro pict '99999999'
	      @10,25 say nombre
	      select 3
	      seek(wkey)
	      if found()
	      	replace b.domici with c.domici
	      	replace b.provin with c.provin
	      	replace b.dpto   with c.dpto
	      	replace b.locali with c.locali
	      endif
    	  select 2
     	 skip
      enddo
  endif   
*endif
@04,01 clear to 23,78
close all
return

