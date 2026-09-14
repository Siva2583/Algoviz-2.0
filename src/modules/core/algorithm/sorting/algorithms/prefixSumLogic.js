export const generatePrefix=(inputStr,targetStrL,targetStrR)=>{
    let curarr=inputStr.split(',').filter(Boolean).map(Number);
    let l=Number(targetStrL);
    let r=Number(targetStrR);
    let prefixarr=[];
    let animations=[];
    if (!curarr.length || curarr.some(n => !Number.isFinite(n)) || !Number.isInteger(l) || !Number.isInteger(r) || l < 0 || r < l || r >= curarr.length) {
        return [{ type: 'result', L: l, R: r, msg: 'Invalid range: use integer indices 0 ≤ L ≤ R < array length.' }];
    }
    animations.push({
        type:'start_build',
        L:l,
        R:r ,
        msg:`Starting at L : ${l} and R : ${r}...`
    });
    for(let i=0;i<curarr.length;i++){
        if(i==0){
            prefixarr[i]=curarr[i];
            animations.push({
                type:'drop_box',
                activeIndex:i,
                currentPrefixArray:[...prefixarr],
                L:l,
                R:r,
                msg:'Dropping first box to the prefix array..'
            })
            continue;
        }
        animations.push({
            type:'calc_sum',
            activeIndex:i,
            currentPrefixArray:[...prefixarr],
            msg:`Calculating curent prefix sum ${prefixarr[i-1]} +  ${curarr[i]}`
        });
        prefixarr[i]=prefixarr[i-1]+curarr[i];
        animations.push({
            type:'commit_sum',
            activeIndex:i,
            currentPrefixArray:[...prefixarr],
            msg:`Curent prefix sum : ${prefixarr[i]}`
        });
        
    }
    animations.push({
        type:'start_query',
        L:l,
        R:r,
        msg:`Starting Query where L : ${l} and R : ${r}`

    });
    let rsum=prefixarr[r];
    animations.push({
        type:'grab_total',
        L:l,
        R:r,
        msg:`Grabbing total Prefix Sum till R : ${prefixarr[r]}`

    });

    let lsum=l==0 ? 0:prefixarr[l-1];
    if(l>0){
    animations.push({
        type:'grab_trash',
        L:l,
        R:r,
        msg:`Grabbing unwanted Prefix Sum before L : ${lsum}`

    });
    
    animations.push({
        type:'subtract',
        L:l,
        R:r,
        msg:`Removing unwanted Prefix Sum before L from total sum :${prefixarr[r]} - ${prefixarr[l-1]}`

    });
}
    let res=rsum-lsum;
    animations.push({
        type:'result',
        L:l,
        R:r,
        msg:`Final Result is ${res}`

    });
    return animations;

    


}